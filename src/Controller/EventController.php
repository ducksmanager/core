<?php

namespace App\Controller;

use App\Service\EventService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class EventController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/events"
     * )
     */
    public function getEvents(EventService $eventService): JsonResponse
    {
        return new JsonResponse(array_merge(
            $eventService->retrieveBookstoreCreations(),
            $eventService->retrieveCollectionUpdates(),
            $eventService->retrieveCollectionSubscriptionAdditions(),
            $eventService->retrieveEdgeCreations(),
            $eventService->retrieveNewMedals(),
            $eventService->retrieveSignups()
        ));
    }
}