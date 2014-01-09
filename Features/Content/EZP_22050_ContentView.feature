@editorial @ezp-22050
Feature: Test Content View page for the Editorial Interface
            As an Editor I want to have a Content View In order to view Content in Editorial interface
            
    Scenario: Verify that all page elements are present on Content Zone
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page 
        Then I see "Content Zone" element 
        And I see "Content Tab" element
        And I see "Content" element 
        And I see "Sub Items" element

    Scenario Outline: Use breadcrumbs in Content Zone to navigate
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page 
        And I see "Content Zone" element
        And I see "breadcrumb" element
        And on "breadcrumb" I click <element>  
        Then I see <element_url> page 

        Examples: 
            | element                   | element_url                                               |
            | Home                      | /                                                         |
            | Getting Started           | /getting-started                                          |
            | Selected Features         | /getting-started/selected-features                        |
            | Reaching for the Stars    | /getting-started/selected-features/reaching-for-the-stars | 

    Scenario Outline: Check that breadcrumbs are correctly updated
        Given I am logged in as "Editor"
        When I am on the <page_url> page
        Then on "breadcrumb" I see <breadcrumb> text
    
        Examples:
            | page_url                                                  | breadcrumb                                                            |
            | /                                                         | Home                                                                  |  
            | /getting-started                                          | Home / Getting Started                                                |
            | /getting-started/selected-features                        | Home / Getting Started / Selected Features                            |
            | /getting-started/selected-features/reaching-for-the-stars | Home / Getting Started / Selected Featires / Reaching for the Stars   |

    Scenario Outline: Verify that the Content fields are present in Content Zone
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page
        And I see "Content Zone" element
        And I see <field_group> element
        Then on <field_group> I see <fields> text
        And on <field_xpath> I see <field_value> text 

        Examples:
            | field_group   | field_name    | field_xpath                           | field_value                               |
            | texts         | Name          | //[@class=’name-text’]/text()         | Reaching for the stars                    |
            | texts         | Short-name    | //[@class=’short-name-text’]/text()   | SelFeat                                   |
            | texts         | Copy          | //[@class=’copy-text’]/text()         | eZPublish Entreprise is the platform ...  |
            | media         | Article Image | //[@class=’image-smth’]/@src          | /var/storage/images/image-1.jpg           |
            | media         | Article Image | //[@class=’image-smth’]/@caption      | Does what it means on the tin.            |

    Scenario Outline: Verify that the Content fields are collapsable
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page
        And on <element_group> I click <collapse> button
        Then on <element_group> I check visibility <value>

        Examples:
            | element_group | collapse  | value     |
            | texts         | collapse  | collapsed |
            | texts         | expand    | expanded  |
            | media         | collapse  | collapsed |
            | media         | expand    | expanded  |
        
    Scenario Outline: Verify that the Content “rollup” is collapsable
        Given I am logged in as "Editor"
        And I am on the "Reaching for the stars" page
        When on "Content" I click <collapse> button
        Then on "Content" I check visiblity <value>
        
        Examples: 
            | collapse  | value     |
            | collapse  | collapsed |
            | expand    | expanded  |
        