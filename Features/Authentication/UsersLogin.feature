Feature: Basic user with different roles login tests

    @javascript
    Scenario: As a Editor User, I want login to PlatformUI
        Given I am logged in as an 'Editor' in PlatformUI
        Then I should see "Welcome to eZ Platform" title

    @javascript
    Scenario: As a Administrator User, I want login to PlatformUI
        Given I am logged in as an 'Administrator' in PlatformUI
        Then I should see "Welcome to eZ Platform" title
