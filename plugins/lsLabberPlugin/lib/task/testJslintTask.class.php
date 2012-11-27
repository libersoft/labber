<?php

class testJslintTask extends sfBaseTask {

    protected function configure() {
        $this->addOptions(array(
            new sfCommandOption('application', null, sfCommandOption::PARAMETER_REQUIRED, 'The application name'),
            new sfCommandOption('env', null, sfCommandOption::PARAMETER_REQUIRED, 'The environment', 'dev'),
            new sfCommandOption('connection', null, sfCommandOption::PARAMETER_REQUIRED, 'The connection name', 'doctrine'),
        ));

        $this->addArgument('file', sfCommandArgument::OPTIONAL, 'path to file');

        $this->namespace = 'test';
        $this->name = 'jslint';
        $this->briefDescription = 'Launches jslint tests';
        $this->detailedDescription = <<<EOF
The [test:jslint|INFO] task execute jslint test on every js file found in web/.
Call it with:

  [php symfony test:jslint|INFO]
EOF;
    }

    protected function execute($arguments = array(), $options = array()) {
        if (empty($arguments['file'])) {
            echo "Running tests on " . sfConfig::get("sf_web_dir") . "\n";
            system("find " . sfConfig::get("sf_web_dir") . "/lsLabberPlugin/js/ -name *.js -exec java -jar " . sfConfig::get("sf_data_dir") . "/jslint/jslint4java.jar {} \;");
        } else {
            echo "Running tests on " . $arguments['file'] . "\n";
            system("java -jar " . sfConfig::get("sf_data_dir") . "/jslint/jslint4java.jar " . $arguments['file']);
        }
    }

}
