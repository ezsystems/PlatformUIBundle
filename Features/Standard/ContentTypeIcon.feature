Feature: Content Type icons

    @javascript
    Scenario: Content items of a type without an icon get the default icon
        Given a Content Type without a defined "ez-contenttype-icon-<identifier>" CSS class
          And a Content item of this type exists
         When I view this Content
         Then the "generic" Content Type icon is attached to the title

    @javascript
    Scenario: Content items of a type with an icon get this icon
        Given a Content item of type "folder"
         When I view this Content
         Then the "folder" Content Type icon is attached to the title

    @javascript
    Scenario: The Content Type icon can be customized for a given Content Type with a CSS rule
        Given a Content item of type "folder"
         When I view this Content
         Then the title element has the class "ez-contenttype-icon-folder"

    @javascript
    Scenario: Content items in the Content Tree have an icon based on their type
        Given I display the Content Tree
         Then I see an icon based on the Content Type for each Content item

    @javascript
    Scenario: Content items in the subitem grid view without a filled image field have an icon based on their type
        Given A Content item with several subitems with and without a filled image field
         When I view the subitems grid
         Then each content item without a filled image field has an icon based on its type
          And each content item with a filled image field is represented with a variation of this image

    @javascript
    Scenario: Each Content Type in the Content Type Group page has an icon
         When I view the Content Type list in a Content Type Group page
         Then each content type has an icon that depends on its type
