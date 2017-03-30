<?php

namespace spec\EzSystems\PlatformUIBundle\Hybrid\Mapper;

use EzSystems\PlatformUIBundle\Hybrid\Mapper\PjaxResponseHybridViewMapper;
use EzSystems\PlatformUIBundle\Hybrid\View\PjaxView;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Response;

/**
 * @method Response MapResponse(Response $response)
 */
class PjaxResponseHybridViewMapperSpec extends ObjectBehavior
{
    function let(Response $response)
    {
        $response->getContent()->willReturn(
            file_get_contents(__DIR__ . '/_fixtures/pjax_response.html')
        );
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(PjaxResponseHybridViewMapper::class);
    }

    function it_maps_to_a_PjaxView(Response $response)
    {
        $this->mapResponse($response)->shouldHaveType(PjaxView::class);
    }

    function it_parses_the_title(Response $response)
    {
        $this->mapResponse($response)->shouldHaveTitle('Response title');
    }

    function it_parses_the_content(Response $response)
    {
        $this->mapResponse($response)->shouldHaveContent('Server side content');
    }

    function getMatchers()
    {
        return [
            'haveTitle' => function (PjaxView $view, $expectedTitle) {
                return $view->getTitle() == $expectedTitle;
            },
            'haveContent' => function (PjaxView $view, $expectedContent) {
                return $view->getContent() == $expectedContent;
            },
        ];
    }
}
