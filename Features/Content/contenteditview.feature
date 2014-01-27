@editorial
Feature: Test Content View page for the Editorial Interface
  As an Editor I want to have a Content View In order to view Content in Editorial interface

  @ezp-22050 @qa-197 @javascript
  Scenario: Verify that all page elements are present on Content Zone
    Given I am logged in as "Editor"
    When I am on the "Reaching for the stars" page
    Then I see "Content Zone" element
    And I see "Content Tab" element
    And I see "Content" element
    And I see "Sub Items" element

  @ezp-22050 @qa-197 @javascript
  Scenario Outline: Use breadcrumbs in Content Zone to navigate
    Given I am logged in as "Editor"
    When I am on the "Reaching for the stars" page
    And I see "Content Zone" element
    And I see "breadcrumb" element
    And on "breadcrumb" I click <element>
    Then I see <element_url> page

    Examples: 
      | element                | element_url                                               |
      | Home                   | /                                                         |
      | Getting Started        | /getting-started                                          |
      | Selected Features      | /getting-started/selected-features                        |
      | Reaching for the Stars | /getting-started/selected-features/reaching-for-the-stars |

  @ezp-22050 @qa-197 @javascript
  Scenario Outline: Check that breadcrumbs are correctly updated
    Given I am logged in as "Editor"
    When I am on the <page_url> page
    Then on "breadcrumb" I see <breadcrumb> text

    Examples: 
      | page_url                                                  | breadcrumb                                                          |
      | /                                                         | Home                                                                |
      | /getting-started                                          | Home / Getting Started                                              |
      | /getting-started/selected-features                        | Home / Getting Started / Selected Features                          |
      | /getting-started/selected-features/reaching-for-the-stars | Home / Getting Started / Selected Featires / Reaching for the Stars |

  @ezp-22050 @qa-197 @javascript
  Scenario Outline: Verify that the Content fields are present in Content Zone
    Given I am logged in as "Editor"
    When I am on the "Reaching for the stars" page
    And I see "Content Zone" element
    And I see <field_group> element
    Then on <field_group> I see <fields> text
    And on <field_xpath> I see <field_value> text

    Examples: 
      | field_group | field_name    | field_xpath                         | field_value                              |
      | texts       | Name          | //[@class=’name-text’]/text()       | Reaching for the stars                   |
      | texts       | Short-name    | //[@class=’short-name-text’]/text() | SelFeat                                  |
      | texts       | Copy          | //[@class=’copy-text’]/text()       | eZPublish Entreprise is the platform ... |
      | media       | Article Image | //[@class=’image-smth’]/@src        | /var/storage/images/image-1.jpg          |
      | media       | Article Image | //[@class=’image-smth’]/@caption    | Does what it means on the tin.           |

  @ezp-22050 @qa-197 @javascript
  Scenario Outline: Verify that the Content fields are collapsable
    Given I am logged in as "Editor"
    When I am on the "Reaching for the stars" page
    And on <element_group> I click <collapse> button
    Then on <element_group> I check visibility <value>

    Examples: 
      | element_group | collapse | value     |
      | texts         | collapse | collapsed |
      | texts         | expand   | expanded  |
      | media         | collapse | collapsed |
      | media         | expand   | expanded  |

  @ezp-22050 @qa-197 @javascript
  Scenario Outline: Verify that the Content “rollup” is collapsable
    Given I am logged in as "Editor"
    And I am on the "Reaching for the stars" page
    When on "Content" I click <collapse> button
    Then on "Content" I check visiblity <value>

    Examples: 
      | collapse | value     |
      | collapse | collapsed |
      | expand   | expanded  |

  @ezp-22107 @qa-197 @javascript
  Scenario: Verify that all tabs are present
    Given I am logged in as "Editor"
    When I am on the "Reaching for the starts" page
    Then I see tabs:
      | tab_names |
      | View      |
      | Details   |
      | Activity  |
      | Analytics |

  @ezp-22107 @qa-197 @javascript
  Scenario Outline: Verify that all tabs show the correct content
    Given I am logged in as "Editor"
    When I am on the "Reaching for the starts" page
    And I click <tab_name>
    Then on "Content Zone" I see <tab_content> content

    Examples: 
      | tab_name  | tab_content       |
      | View      | View Content      |
      | Details   | Details Content   |
      | Activity  | Activity Content  |
      | Analytics | Analytics Content |

  @ezp-21181 @qa-197 @javascript
  Scenario: Verify that Content Edit View is shown on edit button click
    Given I am logged in as "Admin"
    And I am on the "Getting Started" page
    When I click on "edit" button
    Then I see "Content Edit View" element
    And on "Content Edit View" I see "Title" element
    And on "Title" I see "Getting Started" text

  @ezp-21181 @qa-197 @javascript
  Scenario: Verify that the technical details of the content are revealed when the mouse pointer is over the title
    Given I am logged in as "Admin"
    When I edit "Getting Started" content
    And I hover on "Title" element
    Then I see "Content Details" element

  @ezp-21181 @qa-197 @javascript
  Scenario: Verify that content edit interface is closed with the close button
    Given I am logged in as "Admin"
    And I edit "Getting Started" content
    When I click on "close" button
    Then I do not see "Content Edit View" element

 # TODO: This table will need updates since cotent is not yet available the xpath are incorrect 
 @ezp-21181 @qa-197 @javascript
  Scenario: Verify that content edit interface form and elements are present with the correct content
    Given I am logged in as "Admin"
    When I edit "Reaching for the stars poster" content
    Then on "Content Edit View" element I see "Form View" element
    And on Form View element I see Content Fields:
      | field_group | field       | field_xpath                          | field_content                               |
      | Texts       | Title       | //[@class='title-text']/text()       | Reaching for the stars poster               |
      | Texts       | Short Title | //[@class='short-title-text']/text() | Selling Feature                             |
      | Texts       | Body        | //[@class='body-text']/text()        | Animation reveals the coronal ejections ... |
      | Media       | Image       | //[@class=’image-smth’]/@src         | /var/storage/images/image-1.jpg             |
      | Meta        | Tags        | //[@class='meta-tags']               | poster                                      |

   @ez-21181 @qa-197 @javascript
  Scenario Outline: Verify that content edit field groups are collapsible
    Given I am logged in as "Admin"
    When I edit "Getting Started" content
    When on <field_group_name> I click <visibility_button>
    Then on <field_group_name> I check visibility <visibility_value>

    Examples: 
      | field_group_name | visiblility_button | visibility_value |
      | Texts            | collapse           | collapsed        |
      | Texts            | expand             | expanded         |
      | Media            | collapse           | collapsed        |
      | Media            | expand             | expanded         |
      | Meta             | collapse           | collapsed        |
      | Meta             | expand             | expanded         |

  @ezp-21311 @qa-197 @javascript
  Scenario: Verify that content edit interface is closed by pressing Escape Key
    Given I am logged in as "Admin"
    And I edit "Getting Started" content
    When I press "Escape" key
    Then I do not see "Content Edit View" element
