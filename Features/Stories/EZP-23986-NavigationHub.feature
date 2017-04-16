Feature: As an editor, I want to have a navigation hub to navigate through the PlatformUI
    
    @javascript
    Scenario: Message when using empty author field
        Given I go to PlatformUI app with username "admin" and password "publish"
        #When I go to the homepage
        Then I shouldn't see the following elements:
            | link        |
            | eZ Exchange | 

    @javascript
    Scenario: Validate top menu links
        Given I go to PlatformUI app with username "admin" and password "publish"
        #When I go to the homepage
        Then I should see the following elements:
           | zone        |    
           | Platform    |
           | Studio      |
           | Studio Plus | 
           | Admin Panel |

    @javascript
    Scenario: Validate Admin Panel links - Add the navigation items for the existing admin pages
        Given I go to PlatformUI app with username "admin" and password "publish"
        When I click on the menu zone "Admin Panel"
        Then I should see the following elements:
            | zone                     |
            | Administration dashboard |
            | System information       |
            | Sections                 |
    
    @javascript
    Scenario: Hide the navigation menu when the user is displaying a view not related to any navigation items
        Given I go to PlatformUI app with username "admin" and password "publish"
        When I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Article"
        Then I shouldn't see the following elements:
            | zone              |
            | Platform          |
            | Studio            |
            | Studio Plus       |
            | Admin Panel       |
            | Content Structure |
            | Media library     |
