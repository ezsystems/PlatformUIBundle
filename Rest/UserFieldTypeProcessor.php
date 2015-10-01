<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest;

use eZ\Publish\Core\REST\Common\FieldTypeProcessor;

class UserFieldTypeProcessor extends FieldTypeProcessor
{
    public function preProcessValueHash($incomingValueHash)
    {
        if (isset($incomingValueHash['password'])) {
            $incomingValueHash['passwordHash'] = $incomingValueHash['password'];
            unset($incomingValueHash['password']);
        }

        return $incomingValueHash;
    }
}
