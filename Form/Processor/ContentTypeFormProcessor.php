<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Processor;

use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;

class ContentTypeFormProcessor implements EventSubscriberInterface
{
    /**
     * @var RouterInterface
     */
    private $router;

    public function __construct( RouterInterface $router )
    {
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            RepositoryFormEvents::CONTENT_TYPE_PUBLISH => ['processPublishContentType', -10]
        ];
    }

    public function processPublishContentType( FormActionEvent $event )
    {
        $url = $this->router->generate(
            'admin_contenttypeView',
            ['contentTypeId' => $event->getData()->contentTypeDraft->id, 'languageCode' => $event->getOption( 'languageCode' )]
        );
        $event->setResponse( new RedirectResponse( $url ) );
        // TODO: Add confirmation flash message.
    }
}
