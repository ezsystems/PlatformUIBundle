<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest;

use eZ\Publish\Core\REST\Common\FieldTypeProcessor;

/**
 * @deprecated Since 1.10, handled in kernel.
 * @link https://github.com/ezsystems/ezpublish-kernel/blob/master/eZ/Publish/Core/REST/Common/FieldTypeProcessor/UserProcessor.php
 */
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

    public function postProcessValueHash($outgoingValueHash)
    {
        unset($outgoingValueHash['passwordHash'], $outgoingValueHash['passwordHashType']);

        return $outgoingValueHash;
    }
}
