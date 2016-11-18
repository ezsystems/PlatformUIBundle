<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Translation;

use Symfony\Component\Translation\Extractor\AbstractFileExtractor;

abstract class PlatformUIExtractor extends AbstractFileExtractor
{
    private $pathSuffix = 'Resources/views';

    /**
     * Updates the resource by replacing the path to templates (Resource/views)
     * with the path handled by the extractor.
     *
     * @param string $resource
     * @param string $path The path 'Resources/views' should be replaced with
     */
    protected function updateResource(&$resource, $path)
    {
        if (is_string($resource) && strpos($resource, $this->pathSuffix) !== null) {
            $resource = $this->replacePath($resource, $path);
        } elseif (is_array($resource)) {
            $resource = array_map(
                function ($value) use ($path) {
                    if (is_string($value) && strpos($value, $this->pathSuffix) !== null) {
                        return $this->replacePath($value, $path);
                    } else {
                        return $value;
                    }
                },
                $resource
            );
        }
    }

    /**
     * @param string $in
     * @param string $path
     * @return string
     */
    private function replacePath(&$in, $path)
    {
        return str_replace($this->pathSuffix, $path, $in);
    }
}
