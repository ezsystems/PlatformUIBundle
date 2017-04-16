Feature: See "This field is empty" if Tag field is empty

    @javascript
    Scenario: As an editor, I want to see the content of the keywords fields
        Given I go to PlatformUI app with username "admin" and password "publish"
        And there is a content "Blog" of type "blog" at "/" with fields:
        """
        name
        ===
        TestBlog
        """
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        When I click on the "Ze manel" link
        Then I should see an element 'Tags' with value 'This field is empty'

    @javascript
    Scenario: As an editor, I want to see the content of the keywords fields
        Given I go to PlatformUI app with username "admin" and password "publish"
        And there is a content "Folder" of type "folder" at "/" with fields:
        """
        name
        ===
        TestFolder
        """
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        When I click on the "Ze manel" link
        Then I should see an element 'Tags' with value 'This field is empty'

    @javascript
    Scenario: As an editor, I want to see the content of the keywords fields
        Given I go to PlatformUI app with username "admin" and password "publish"
        And there is a content "Folder" of type "folder" at "/" with fields:
        """
        name
        ===
        TestFolder
        """
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        When I click on the "Ze manel" link
        Then I should see an element 'Tags' with value 'This field is empty'
