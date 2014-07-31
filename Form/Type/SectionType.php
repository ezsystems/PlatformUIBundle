<?php
/**
 * File containing the SectionType class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Type;

use eZ\Publish\API\Repository\Exceptions\UnauthorizedException;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class SectionType extends AbstractType
{
    public function buildForm( FormBuilderInterface $builder, array $options )
    {
        $builder
            ->add(
                'name', 'text', array(
                    'constraints' => array(
                        new Notblank(), new Length( array( 'min' => 1, 'max' => 255 ) )
                    )
                )
            )
            ->add(
                'identifier', 'text', array(
                    'constraints' => array(
                        new Notblank(), new Length( array( 'min' => 1, 'max' => 255 ) )
                    )
                )
            )
            ->add( 'save', 'submit' );
    }

    public function getName()
    {
        return 'ezplatformui_section';
    }

    public function setDefaultOptions( OptionsResolverInterface $resolver )
    {
            $resolver->setDefaults( array( 'data_class' => 'EzSystems\PlatformUIBundle\Entity\SectionCreateStruct' ) );
    }
}
