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

class PjaxController extends Controller
{
    /**
     * Returns the HTTP status code to use when the user does not have access to
     * a ressource so that the JS code can detect if the user needs to be
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
                && $user->id == $this->getConfigResolver()->getParameter( "anonymous_user_id" )
            )
        );
    }
}
