Feature: Use the drag&drop feature with binary, image and video files

    ##
    # Drag & Drop on binary fieldtype
    ##
    @javascript
    Scenario: Drag and drop valid binary files to fill the binary field
        Given I am logged in as admin on PlatformUI
        And I create a content of content type "File" with
            | Name*       |
            | BinaryFile1 |
        When I drag and drop a file "File1.txt" to upload
        When I click on the actionbar action "Publish"
        Then I should see "BinaryFile1" title
        And I should see element "File" with file "File1.txt"

    ##
    # Drag & Drop on image fieldtype
    ##
    @javascript
    Scenario Outline: Drag and drop valid image files to fill the image field
        Given I am logged in as admin on PlatformUI
        And I create a content of content type "Image" with
            | Name*  |
            | <name> |
        When I drag and drop a file <Image> to upload
        When I click on the actionbar action "Publish"
        Then I should see "ImageFile1" title
        And I should see element "Image" with image

        Examples:
            | Name       | Image               |
            | ImageFile1 | Jellyfish_JPG.jpg   |
            | ImageFile2 | Jellyfish_GIF.gif   |
            | ImageFile3 | Jellyfish_PNG.png   |
            | ImageFile4 | Jellyfish_TIFF.tiff |

    @javascript
    Scenario Outline: Drag and drop invalid image files to fill the image field
        Given I am logged in as admin on PlatformUI
        And I create a content of content type "Image" with
            | Name*  |
            | <name> |
        When I drag and drop a file <Image> to upload
        When I click on the actionbar action "Publish"
        Then I should see <errorMessage> text

        Examples:
            | Name       | Image      | errorMessage                                                                                        |
            | ImageFile1 | File1.txt  | The file 'File1.txt' was refused because it seems to not be an image. Please choose an image file.  |
            | ImageFile2 | Video4.mp4 | The file 'Video4.mp4' was refused because it seems to not be an image. Please choose an image file. |

    ##
    # Drag & Drop on video fieldtype
    ##
    @javascript
    Scenario: Drag and drop valid video files to fill the video field
        Given I am logged in as admin on PlatformUI
        And I create a content of content type "Video" with
            | Name*      |
            | VideoFile1 |
        When I drag and drop a file "Video1.mp4" to upload
        When I click on the actionbar action "Publish"
        Then I should see "VideoFile1" title
        And I should see element "File" with file "Video1.mp4"
