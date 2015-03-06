## Installation:
* Update behat.yml with PlatformUI parameters( check example behat.yml provided );
* Make sure the wanted needed feature files are present;
* And added to the behat.yml;
* That's it!

## Known issues:
* Sahi web driver can't publish content;
* Selenium web driver does not work with Firefox 35 and up, Firefox 34 recommended;
* Running multiple scenarios impossible due to cookies issue with PlatformUI;

## How to run:
* Selenium
 * Download the latest Selenium server .jar file from the [offical site]( http://www.seleniumhq.org/download/ );
 * In the directory where the Selenium server .jar was downloaded run the command `$ java -jar <selenium server filename>.jar`
 * Now Selenium server is up and running;
 * On your ezpublish installation directory run the command `$ php bin/behat --profile platformui`
 * That's it!
    
* Sahi
 * Download the latest Sahi server from [here](http://sourceforge.net/projects/sahi/files/);
 * Extract the Sahi server to a desired directory, navigate to the bin/ directory inside and run the command `$ ./sahi.sh`
 * Now Sahi server is up and running;
 * On your ezpublish installation directory run the command `$ php bin/behat --profile platformui`
 * That's it!

#### Check Sentences file provided for all the available sentences.
