Feature: See that hovering a menu option doesn't change submenu context 

    @javascript
    Scenario: I want to see that submenu context remains after hovering to other menu link	
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Deliver"
        When I over on the menu zone "Create"
        Then I don't see "Content structure" text
