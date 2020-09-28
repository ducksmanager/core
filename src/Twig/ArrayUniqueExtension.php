<?php
namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class ArrayUniqueExtension extends AbstractExtension
{
    public function getFilters(){
        return [
            new TwigFilter('unique', [$this, 'arrayUnique']),
        ];
    }

    public function arrayUnique(array $array) {
        return array_unique($array);
    }
}