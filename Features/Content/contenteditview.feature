@ezp-22050 @qa-197 @javascript @editorial
Feature: Test Content View and Edit in the new Editorial Interface
  As an Editor I want to View and Edit Content using the Editorial Interface

  @ezp-22050 @qa-197
  Scenario: All page elements are present on Content Zone
    Given I am logged in as "Editor"
    When I go to "Reaching for the stars" page
    Then I see "Content Zone" element
    And I see "Content Tab" element
    And I see "Content" element
    And I see "Sub Items" element

  @ezp-22050 @qa-197
  Scenario: Navigation Path (breadcrumbs) is present in Content Zone
    Given I am logged in as "Editor"
    When I go to "Reaching for the stars" page
    Then on "Content Zone" I see "Navigation Path" element

  @ezp-22050 @qa-197
  Scenario Outline: Use Navigation Path breadcrumbs to navigate on existing tree
    Given I am logged in as "Editor"
    And I am on the "Reaching for the stars" page
    When on "Navigation Path" I click <element>
    Then I see <element_url> page

    Examples: 
      | element                | element_url                                               |
      | Reaching for the Stars | /getting-started/selected-features/reaching-for-the-stars |
      | Selected Features      | /getting-started/selected-features                        |
      | Getting Started        | /getting-started                                          |
      | Home                   | /                                                         |

  @ezp-22050 @qa-197
  Scenario Outline: Navigation Path is correctly updated
    Given I am logged in as "Editor"
    When I go to <page_url> page
    Then on "Navigation Path" I see <breadcrumb> text

    Examples: 
      | page_url                                                  | breadcrumb                                                          |
      | /                                                         | Home                                                                |
      | /getting-started                                          | Home / Getting Started                                              |
      | /getting-started/selected-features                        | Home / Getting Started / Selected Features                          |
      | /getting-started/selected-features/reaching-for-the-stars | Home / Getting Started / Selected Featires / Reaching for the Stars |

  @ezp-22050 @qa-197
  Scenario: Content field groups are present in Content Zone
    Given I am logged in as "Editor"
    When I go to "Reaching for the stars" page
    Then on "Content Zone" I see <field_group> element:
      | field_group |
      | texts       |
      | media       |

  @ezp-22050 @qa-197
  Scenario: Field groups contain the correct field elements
    Given I am logged in as "Editor"
    When I go to "Reaching for the stars" page
    Then on "texts" I see elements:
	 | field_name    |
	 | Name          |
	 | Short-name    |
	 | Copy          |
    And  on "media" I see elements:
	| field_name	|
	| Article Image |
        | Article Image |

  @ezp-22050 @qa-197
  Scenario: Fields contain the correct values
    Given I am logged in as "Editor"
    When I go to "Reaching for the stars" page
    Then on content fields I see values:
      | field_name    | field_value                              |
      | Name          | Reaching for the stars                   |
      | Short-name    | SelFeat                                  |
      | Copy          | eZPublish Entreprise is the platform ... |
      | Article Image | /var/storage/images/image-1.jpg          |
      | Article Image | Does what it means on the tin.           |

  # Content is presented in a structured way: Attribute names and values are positioned side by side.
  # The rationale behind this is to give users a better overview and also to make it clear that this view is not a web-preview.
  # Text-fields are collapsable so that the user gains a better overview of the object contents when using classes with many attributes
  @ezp-22050 @qa-197
  Scenario Outline: Content fields are collapsable
    Given I am logged in as "Editor"
    When I am on the "Reaching for the stars" page
    And on <element_group> I click <collapse> button
    Then the <element_group> is <value>

    Examples: 
      | element_group | collapse | value     |
      | texts         | collapse | collapsed |
      | texts         | expand   | expanded  |
      | media         | collapse | collapsed |
      | media         | expand   | expanded  |

  @ezp-22050 @qa-197
  Scenario Outline: Content "rollup" is collapsable
    Given I am logged in as "Editor"
    And I am on the "Reaching for the stars" page
    When on "Content" I click <collapse> button
    Then on "Content" I check visiblity <value>

    Examples: 
      | collapse | value     |
      | collapse | collapsed |
      | expand   | expanded  |


  @ezp-22107 @qa-197
  Scenario Outline: All tabs show the correct content
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

  # Display the title
  # Trigger the rendering of FormView and ActionBar views
  @ezp-21181 @qa-197
  Scenario: Content Edit View is shown on edit button click
    Given I am logged in as "Admin"
    And I am on the "Getting Started" page
    When I click on "edit" button
    Then I see "Action Bar" element
    Then I see "Content Edit View" element
    And on "Content Edit View" I see "Title" element
    And on "Title" I see "Getting Started" text

  # Handle the display of technical information when the mouse is over the title (always showed in touch devices ?)
  @ezp-21181 @qa-197
  Scenario: Technical details of the content are revealed when the mouse pointer is over the title
    Given I am logged in as "Admin"
    When I edit "Getting Started" content
    And I hover on "Title" element
    Then I see "Content Details" element

  # Handle the close button
  @ezp-21181 @qa-197
  Scenario: Content edit interface is closed with the close button
    Given I am logged in as "Admin"
    And I edit "Getting Started" content
    When I click on "close" button
    Then I do not see "Content Edit View" element

  # TODO: This table will need updates since cotent is not yet available the xpath are incorrect
  @ezp-21181 @ezp-21182 @qa-197
  Scenario: Content edit interface form and elements are present with the correct content
    Given I am logged in as "Admin"
    When I edit "Reaching for the stars poster" content
    Then on "Content Edit View" element I see "Form View" element
    And on Form View element I see Content Fields:
      | field_group | field       | field_content                               |
      | Texts       | Title       | Reaching for the stars poster               |
      | Texts       | Short Title | Selling Feature                             |
      | Texts       | Body        | Animation reveals the coronal ejections ... |
      | Media       | Image       | /var/storage/images/image-1.jpg             |
      | Meta        | Tags        | poster                                      |

  # Handles the fieldsets so that they can be folded/unfolded
  @ez-21182 @qa-197
  Scenario Outline: Content edit field groups are collapsible
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

  @ezp-21311 @qa-197
  Scenario: Content edit interface is closed by pressing Escape Key
    Given I am logged in as "Admin"
    And I edit "Getting Started" content
    When I press "Escape" key
    Then I do not see "Content Edit View" element
