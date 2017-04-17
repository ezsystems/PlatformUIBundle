Scenario: Users not able to login to PlatformUI tests

    @javascript
    Scenario: As a Member User, I can't login to PlatformUI
        Given I am logged in as an 'Member' in PlatformUI
        Then I should see "Invalid username or password" text

    @javascript
    Scenario: As a Partner User, I can't login to PlatformUI
        Given I am logged in as an 'Partner' in PlatformUI
        Then I should see "Invalid username or password" text

    @javascript
    Scenario: As a Subscriber User, I can't login to PlatformUI
        Given I am logged in as an 'Subscriber' in PlatformUI
        Then I should see "Invalid username or password" text


