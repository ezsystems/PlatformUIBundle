<?php

namespace EzSystems\PlatformUIBundle\Components;

use Symfony\Component\HttpFoundation\RequestStack;

class NavigationHub implements Component
{
    const TAG_NAME = 'ez-navigation-hub';

    const ACTIVE_ZONE_CLASS = 'ez-active-zone';

    const MATCHED_LINK_CLASS = 'ez-matched-link';

    protected $templating;

    protected $zones;

    protected $links;

    public function __construct($templating, RequestStack $stack, array $zones, array $links)
    {
        $this->request = $stack->getMasterRequest();
        $this->templating = $templating;
        $this->zones = $zones;
        $this->links = $links;
    }

    public function __toString()
    {
        return $this->templating->render(
            'eZPlatformUIBundle:Components:navigationhub.html.twig',
            [
                'tag' => self::TAG_NAME,
                'attributes' => $this->getAttributes(),
                'zones' => $this->zones,
                'links' => $this->links,
                'activeZone' => $this->getActiveZoneIdentifier(),
                'activeZoneClass' => self::ACTIVE_ZONE_CLASS,
                'matchedLinkClass' => self::MATCHED_LINK_CLASS,
            ]
        );
    }

    protected function getActiveLink()
    {
        foreach ($this->links as $link) {
            if ($link->match($this->request)) {
                return $link;
            }
        }

        return null;
    }

    protected function getActiveZoneIdentifier()
    {
        $link = $this->getActiveLink();
        if ($link) {
            return $link->zone;
        }
        return '';
    }

    protected function getActiveLinkUrl()
    {
        $link = $this->getActiveLink();

        if ($link) {
            return $link->getUrl();
        }
        return '';
    }

    protected function getAttributes()
    {
        return [
            'active-zone-class' => self::ACTIVE_ZONE_CLASS,
            'matched-link-class' => self::MATCHED_LINK_CLASS,
            'active-zone' => $this->getActiveZoneIdentifier(),
            'matched-link-url' => $this->getActiveLinkUrl(),
        ];
    }

    public function jsonSerialize()
    {
        return [
            'selector' => self::TAG_NAME,
            'update' => [
                'attributes' => $this->getAttributes(),
            ]
        ];
    }
}
