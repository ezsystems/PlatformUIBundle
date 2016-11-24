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
     * @param string|array $resource
     * @param string $path The path 'Resources/views' should be replaced with
     *
     * @return string|array The provided $resource, with the path modified
     */
    protected function updateResource($resource, $path)
    {
        if (is_array($resource)) {
            return array_map(
                function ($value) use ($path) {
                    return $this->replacePath($value, $path);
                },
                $resource
            );
        }

        return $this->replacePath($resource, $path);
    }

    /**
     * @param string $in
     * @param string $path
     * @return string
     */
    private function replacePath($in, $path)
    {
        return str_replace($this->pathSuffix, $path, $in);
    }
}
