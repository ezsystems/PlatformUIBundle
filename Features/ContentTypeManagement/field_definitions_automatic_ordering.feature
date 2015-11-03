Feature: Automatic ordering of field definitions when editing a content type
  In order to manage content types
  As an Administrator user
  I need to be able to see field definitions sorted in a sensible, predictable order

  Background:
    Given I am logged in as admin on PlatformUI

  ##
  #
  # Order by position
  #
  ##
  @javascript @common
  Scenario: Order field types of Article content type by position
    Given an "Article" content type exists
    And I am on the "Article" content type view page
    When I edit the "Article" content type
    Then I should see the following field definitions:
      | Title             |
      | Short title       |
      | Summary           |
      | Body              |
      | Subscriber teaser |
      | Image             |
      | Caption (Image)   |
      | Location          |
      | Author            |
      | Publish date      |
      | Star Rating       |
      | Tags              |

  @javascript @common
  Scenario: Change field type position of Article content type
    Given an "Article" content type exists
    And I am on the "Article" content type view page
    When I edit the "Article" content type
    And I set the position of "Title" to 2
    And I set the position of "Short title" to 1
    And I click the "Apply"-button
    Then I should see the following field definitions:
      | Short title       |
      | Title             |
      | Summary           |
      | Body              |
      | Subscriber teaser |
      | Image             |
      | Caption (Image)   |
      | Location          |
      | Author            |
      | Publish date      |
      | Star Rating       |
      | Tags              |

  @javascript @common
  Scenario: Change field type position of Article content type, default to order by identifier
    Given an "Article" content type exists
    And I am on the "Article" content type view page
    When I edit the "Article" content type
    And I set the position of "Image" to 5
    And I click the "Apply"-button
    Then I should see the following field definitions:
      | Short title       |
      | Title             |
      | Summary           |
      | Body              |
      | Image             |
      | Subscriber teaser |
      | Caption (Image)   |
      | Location          |
      | Author            |
      | Publish date      |
      | Star Rating       |
      | Tags              |
