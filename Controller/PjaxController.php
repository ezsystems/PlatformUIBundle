<?php
/**
 * File containing the PjaxController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\Core\MVC\Symfony\Security\User as CoreUser;
use eZ\Bundle\EzPublishCoreBundle\Controller;
use Symfony\Component\HttpFoundation\Response;

class PjaxController extends Controller
{
    /**
     * To be used when access is denied to a user
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function accessDeniedAction()
    {
        $response = new Response();
        $response->setStatusCode( $this->getNoAccessStatusCode() );

        return $response;
    }

    /**
     * Returns the HTTP status code to use when the user does not have access to
     * a resource so that the JS code can detect if the user needs to be
     * authenticated first.
     *
     * @return int 401 if anonymous, 403 otherwise
     */
    protected function getNoAccessStatusCode()
    {
        return $this->isAnonymous() ? 401 : 403;
    }

    /**
     * Checks whether the current user is anonymous
     *
     * @return boolean
     */
    private function isAnonymous()
    {
        $user = $this->getUser();
        return (
            !$user
            || (
                $user instanceof CoreUser
                && $user->getAPIUser()->id == $this->getConfigResolver()->getParameter( "anonymous_user_id" )
            )
        );
    }
}
