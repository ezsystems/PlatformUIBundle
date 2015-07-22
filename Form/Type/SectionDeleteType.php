<?php

/**
 * File containing the SectionDeleteType class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Translation\TranslatorInterface;

class SectionDeleteType extends AbstractType
{
    /**
     * @var \Symfony\Component\Translation\TranslatorInterface
     */
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $submitLabel = $this->translator->trans('section.view.delete', [], 'section');

        $builder
            ->add('identifier', 'hidden')
            ->add('delete', 'submit', ['label' => $submitLabel]);
    }

    public function getName()
    {
        return 'sectiondelete';
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(
            ['data_class' => 'eZ\Publish\API\Repository\Values\Content\SectionUpdateStruct']
        );
    }
}
