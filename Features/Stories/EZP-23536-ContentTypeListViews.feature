Feature: See conten type list related views

    @javascript
    Scenario: As a developer, I want to see the content type list (Content)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        Then I should see elements with the following names:
            | Name                    |
            | Article                 |
            | Banner                  |
            | Blog                    |
            | Blog post               |
            | Call To Action          |
            | Call To Action Feedback |
            | Comment                 |
            | Event                   |
            | Event calendar          |
            | Feedback form           |
            | Folder                  |
            | Forum                   |
            | Forum reply             |
            | Forum topic             |
            | Forums                  |
            | Gallery                 |
            | Landing Page            |
            | Link                    |
            | Place                   |
            | Place list              |
            | Poll                    |
            | Product                 |
            | Wiki Page               |

    @javascript
    Scenario: As a developer, I want to see the content type list (User)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        And I checked "Users" checkbox
        Then I should see elements with the following names:
            | Name       |
            | User       |
            | User group |

    @javascript
    Scenario: As a developer, I dont't want to see the content type list if not selected(User)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        Then I should not see elements with the following names:
            | Name       |
            | User       |
            | User group |

    @javascript
    Scenario: As a developer, I want to see the content type list (Media)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        And I checked "Media" checkbox
        Then I should see elements with the following names:
            | Name  |
            | File  |
            | Image |
            | Video |

    @javascript
    Scenario: As a developer, I want to see the content type list (Media)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        Then I should not see elements with the following names:
            | Name  |
            | File  |
            | Image |
            | Video |

    @javascript
    Scenario: As a developer, I want to see the content type list (Setupt)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        And I checked "Setup" checkbox
        Then I should see elements with the following names:
            | Name                |
            | Common ini settings |
            | Template look       |

    @javascript
    Scenario: As a developer, I want to see the content type list (Setupt)
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        Then I should not see elements with names:
            | Name                |
            | Common ini settings |
            | Template look       |
