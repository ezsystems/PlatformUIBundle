@editorial @ezp-22050
Feature: Test Content View page for the Editorial Interface
            As an Editor I want to have a Content View In order to view Content in Editorial interface
            
    Scenario: Verify that all page elements are present on Content Zone
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page 
        Then I see "Content Zone" element 
        And I see "Content Tab" element
        And I see "Content <??>" element 
        And I see "Sub Items" element

    Scenario Outline: Use breadcrumbs in Content Zone to navigate
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page 
        And I see "Content Zone" element
        And I see "breadcrumb" element
        And On "breadcrumb" I click <element>  
        Then I see <element_url> page 

        Examples: 
            | element                   | element_url                   |
            | Home                      | HomePage                      |
            | Getting Started           | Getting Started Page          |
            | Selected Features         | Selected Features Page        |
            | Reaching for the Stars    | Reaching for the Stars Page   |

    Scenario Outline: Check that breadcrumbs are correctly updated
        Given I am logged in as "Editor"
        When I am on the <page_url> page
        Then On "breadcrumb" I see <breadcrumb> text
    
        Examples:
            | page_url                      | breadcrumb                        |
            | HomePage                      | HomePage Breadcrumb               |  
            | Getting Started Page          | Getting Started Breadcrumb        |
            | Selected Features Page        | Selected Features Breadcrumb      |
            | Reaching for the Stars Page   | Reaching for the Stars Breadcrumb |

    Scenario Outline: Verify that the Content fields are present in Content Zone
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page
        And I see "Content <??>" element
        And I see <field_group> element
        Then On <field_group> I see <fields> text
        And On <fields> I see <field_value> text 

        Examples:
            | field_group   |  fields       | field_value                           |
            | texts         | Name          | Reaching for the stars Name           |
            | texts         | Short-name    | Reaching for the stars Short-name     |
            | texts         | Copy          | Reaching for the stars Copy           |
            | media         | Article Image | Reaching for the stars Article Image  |

    Scenario Outline: Verify that the Content fields are collapsable
        Given I am logged in as "Editor"
        When I am on the "Reaching for the stars" page
        And On <element_group> I click <collapse> button
        Then On <element_group> I check visibility <value>

        Examples:
            | element_group | collapse  | value     |
            | texts         | collapse  | collapsed |
            | texts         | expand    | expanded  |
            | media         | collapse  | collapsed |
            | media         | expand    | expanded  |
        
