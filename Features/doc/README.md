## Pre-requisites:
* [Behat bundle](https://github.com/ezsystems/BehatBundle) is installed and configured properly;
* [PlatformUI bundle](https://github.com/ezsystems/PlatformUIBundle) is installed and configured properly.

## Installation:
* Update behat.yml, on the installation root, with PlatformUI parameters( check example behat.yml provided );
* Make sure you configure the suites in the behat.yml if you want to add more features;
* That's it!

## Known issues:
* Sahi web driver can't publish content;
* Selenium web driver does not work with Firefox 35 and up, Firefox 34 recommended;
* Currently it is not possible to run multiple scenarios in sequence (using the same browser instance), possible issue with cookies.

## How to run:
* Selenium
 * Download the latest Selenium server .jar file from the [offical site](http://www.seleniumhq.org/download/);
 * In the directory where the Selenium server .jar was downloaded start the Selenium server with the command `$ java -jar <selenium server filename>.jar`
 * On your ezpublish installation directory run the command `$ php bin/behat --profile platformui`
 * That's it!
    
* Sahi
 * Download the latest Sahi server from [here](http://sourceforge.net/projects/sahi/files/);
 * Extract the Sahi server to a desired directory, navigate to the bin/ directory inside and start the Sahi server with the command `$ ./sahi.sh`
 * On your ezpublish installation directory run the command `$ php bin/behat --profile platformui`
 * That's it!

#### Check Sentences file provided for all the available sentences.
