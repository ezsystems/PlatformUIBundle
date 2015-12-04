Feature: Use the eZ Users field

    Background:
        Given I am logged in as an Administrator in PlatformUI

    @javascript @common
    Scenario: Verify the existence of Users page and it's content
        When I click on the navigation zone "Admin Panel"
        And I click on the navigation item "Users"
        Then I see the Users page
        And I see the following users:
            | Name                |
            | Guest accounts      |
            | Administrator users |
            | Editors             |
            | Anonymous Users     |
        And I see the following tabs:
            | Tabs            |
            | View            |
            | Details         |
            | Locations       |
            | Related content |

    @javascript @common
    Scenario: Create a valid user
        Given I am on the Users page
        When I fill a new User fields with:
            | First name | Last name | Login   | Email       | Password |
            | Ze         | Manel     | zemanel | ze@manel.pt | 12345    |
        Then I should see no error messages

    @javascript @edge
    Scenario: Creating users with existing Login should raise an error notification
        Given I am on the Users page
        And there is a User with name "zemanel"
        When I create a new User
        And I fill in "Login" with "zemanel"
        Then I should see error messages

    @javascript @edge
    Scenario: Creating users with empty Login should raise an error notification
        Given I am on the Users page
        When I create a new User
        And I set "Login" as empty
        Then I should see error messages

    @javascript @edge
    Scenario Outline: Creating users with invalid email field should raise an error notification
        Given I am on the Users page
        And there is a User with name "zemanel"
        When I edit user "zemanel"
        And I fill in "Email" with "<value>"
        Then I should see error messages

        Examples:
            | value        |
            | invalidmail  |
            | invalid.mail |
            | invalidmail@ |
            |              |

    @javascript @edge
    Scenario: Creating users with not matching password should raise an error notification
        Given I am on the Users page
        And there is a User with name "zemanel"
        When I edit user "zemanel"
        And I fill in "Password" with "12345"
        And I fill in "Confirm password" with "123456"
        Then I should see error messages
