<?php
/**
 * File containing the Loader class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Loader;

/**
 * JS and CSS loader.
 */
interface Loader
{
    const EXT_JS = 'js';
    const EXT_CSS = 'css';

    /**
     * Returns combined JS or CSS files.
     *
     * It combines a valid list of files (array must have at least one element)
     *
     * @param array $files File name array
     *
     * @return string The content of the combined files
     *
     * @throws \eZ\Publish\Core\Base\Exceptions\NotFoundException
     */
    public function combineFilesContent(array $files);

    /**
     * Returns content type.
     *
     * @param array $files File name array
     *
     * @return string The content type of the combined files
     *
     * @throws \eZ\Publish\Core\Base\Exceptions\InvalidArgumentException
     * @throws \eZ\Publish\Core\Base\Exceptions\NotFoundException
     */
    public function getCombinedFilesContentType(array $files);
}
