Feature: Subitem Grid

    @javascript
    Scenario: The Subitem Grid view is used when viewing a Content item of a Type that belongs to the Media Group
        Given a Content Type of the Media Group flagged as container
          And a Content item of this type
          And this Content item has a subitem
         When I view this Content
         Then The subitems view mode is set to grid
