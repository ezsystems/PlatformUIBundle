@editorial @ezp-22050 @javascript #mandatory?
Feature: Test content view page for the Editorial Interface
    In order to view content in Editorial interface
    As a Editor
    I want to view my content data with the new look and feel

    #https://jira.ez.no/browse/EZP-22050
    #check if all visual elements are present and
    

    # This is need to have editor user available for the next text
    Scenario: Create editor user for editorial bundle tests
        Given I am logged in as "admin"
        When I am on "user-accounts"
        And I create a user named "editor" with password "123456"
        Then On "user-accounts/editors" i see "editor"


    Scenario Outline: Verify that all of interface areas are correctly rendered
        Given I am logged in as "editor" with password "123456"
        When I am on "/" #todo check path to a content view
        Then I see <page_element> element #todo check existing elements of 

        Examples: 
            | page_element      |
            | header            |
            | breadcrumb        |
            | navigation-hub    |
            | side-bar-left     |
            | sied-bar-right    |
            | content           |
            | subitem-list      |
            | footer            |
      
    Scenario Outline: Verify that header is present with the default elements  
        Given I am logged in as "editor" with password "123456"
        When I am on "/"
        Then I see <header_element> element

        Examples: 
            | header_element    |
            | ezlogo            |
            | create            |
            | deliver           |
            | optimize          |
            | eZ Exchange       |
            | Settings          |
            | User Info         |

    Scenario Outline: Verify that content view menu is correctly shown
        Given I am logged in as "editor" with password "123456"
        When I am on "/"
        And I see "content-view" element
        Then On "content-view-menu" I see <link> links
        
        Examples: 
            | link          |
            | View          |
            | Details       |
            | Activity      |
            | Analytics     |

    Scenario Outline: Verify that the object fields are present
        Given I am logged in as "editor" with password "123456"
        When I am on "/"
        And I see "content-view" element
        Then Then On "conent-view-body" I see <fields> text
        
        Examples:
            | fields        |
            | Name          |
            | Short-name    |
            | Copy          |
            | Media         |

    Scenario Outline: Verify that breadcrumb works as expected
        Given I am logged in as "editor" with password "123456"
        When I am on <url> #possibly this wont work, use click instead?
        Then On "breadcrumb" I see <breadcrumb> text

        Examples:
            | url                                                           | breadcrumb                                                            |
            | Home                                                          | Home                                                                  |
            | Home/Getting Started                                          | Home / Getting Started                                                |
            | Home/Getting Started/Selected Features                        | Home / Getting Started / Selected Feature                             |
            | Home/Getting Started/Selected Features/Reaching for the Stars | Home / Getting Started / Selected Features / Reaching for the Stars   |
