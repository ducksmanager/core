<?php

namespace App\Service;

use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\ClientException;
use Symfony\Component\Security\Core\Security;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class ApiService
{
    private HttpClientInterface $client;
    private LoggerInterface $logger;
    private Security $security;

    private const CHUNKABLE_URLS = [
        '/coa/list/countries' => 50,
        '/coa/list/publications' => 10
    ];

    public function __construct(HttpClientInterface $client, LoggerInterface $logger, Security $security)
    {
        $this->client = $client;
        $this->logger = $logger;
        $this->security = $security;
    }

    /**
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function call(string $url, string $role, ?array $parameters = [], string $method = 'GET', bool $doNotChunk = false, array $userCredentials = [], bool $noParse = false): bool|array|ResponseInterface|null
    {
        if (!$doNotChunk && isset(self::CHUNKABLE_URLS[$url])) {
            return $this->callWithChunks($url, $role, $parameters, $method);
        }
        $fullUrl = "http://web-api$url" . ($method === 'GET' && !empty($parameters) ? '/'.implode('/', $parameters) : '');
        $user = $this->security->getUser();
        $response = $this->client->request(
            $method,
            $fullUrl, [
                'auth_basic' => [$role, $_ENV['ROLE_PASSWORD_' . strtoupper($role)]],
                'headers' => [
                    'Content-Type: application/x-www-form-urlencoded',
                    'Cache-Control: no-cache',
                    'x-dm-version: 1.0',
                    'x-dm-user: '.($userCredentials['dm-user'] ?? ($user ? $user->getUsername() : '')),
                    'x-dm-pass: '.($userCredentials['dm-pass'] ?? ($user ? $user->getPassword() : '')),
                ],
                'body' => $method === 'GET' ? null : $parameters
            ]
        );

        if ($noParse) {
            return $response;
        }

        return $this->getResponseContentOrBoolOrThrow($response);
    }

    /**
     * @param ResponseInterface $response
     * @return array|bool
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function getResponseContentOrBoolOrThrow(ResponseInterface $response) {
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            if (empty($response->getContent()) || $response->getContent() === 'OK') {
                return true;
            }
            if ($response->getContent() === 'KO') {
                return false;
            }
            return $response->toArray();
        }

        try {
            $this->logger->info("Call to service {$response->getInfo('http_method')} {$response->getInfo('url')} failed, Response code = {$response->getStatusCode()}, response buffer = {$response->getContent()}");
        }
        catch(Exception $e) {
            $this->logger->error($e->getMessage());
        }
        throw new ClientException($response);
    }

    public function callNoParse(string $url, string $role, $parameters = [], $method = 'GET', $doNotChunk = false, $userCredentials = []) : ResponseInterface {
        return $this->call($url, $role, $parameters, $method, $doNotChunk, $userCredentials, true);
    }

    public function runQuery(string $query, string $db, array $parameters = []) {
        return $this->call('/rawsql', 'rawsql', [
            'query' => trim($query),
            'parameters' => $parameters,
            'db' => $db
        ], 'POST' );
    }

    private function callWithChunks($url, $role, array $parameters, $method = 'GET')
    {
        $parameterListChunks = array_chunk(explode(',', $parameters[count($parameters) - 1]), self::CHUNKABLE_URLS[$url]);
        $results = null;
        foreach ($parameterListChunks as $parameterListChunk) {
            $result = $this->call($url, $role, [implode(',', $parameterListChunk)], $method, true);
            if (is_object($result)) {
                $results = is_null($results) ? $result : (object)array_merge_recursive((array)$results, (array)$result);
            } else if (is_array($result)) {
                $results = is_null($results) ? [] : array_merge($results, $result);
            }
        }
        return $results;
    }

}
