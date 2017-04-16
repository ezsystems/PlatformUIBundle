Feature: EZP-23905 - JavaScript error when displaying a content with an empty Url field

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Empty_URL" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | url        | ezurl    | URL  |    
        And there is a content "Empty URL Test" of type "Empty_URL" at "/" with fields:
        """
        title
        ===
        Empty URL Test

        url
        ===

        """
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        When I click on the "Empty URL Test" link
        Then I should see an element 'Name' with value 'Empty URL Test'            
