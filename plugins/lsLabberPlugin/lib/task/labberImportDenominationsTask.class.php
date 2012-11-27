<?php

class labberImportDenominationsTask extends sfBaseTask {

    protected function configure() {

        $this->addOptions(array(
            new sfCommandOption('application', null, sfCommandOption::PARAMETER_REQUIRED, 'The application name'),
            new sfCommandOption('env', null, sfCommandOption::PARAMETER_REQUIRED, 'The environment', 'dev'),
            new sfCommandOption('connection', null, sfCommandOption::PARAMETER_REQUIRED, 'The connection name', 'doctrine'),
        ));

        $this->namespace = 'labber';
        $this->name = 'import-denominations';
        $this->briefDescription = '';
    }

    protected function execute($arguments = array(), $options = array()) {
        // initialize the database connection
        $databaseManager = new sfDatabaseManager($this->configuration);
        $connection = $databaseManager->getDatabase($options['connection'])->getConnection();

        $new_denominations = array(
                // PASTE
                // END PASTE
        );

        $i = 0;
        $denominationTable = Doctrine::getTable('Denomination');

        foreach ($new_denominations as $denomination) {
            $dm = $denominationTable->findOneByName($denomination);
            if (!$dm) {
                $dm = new Denomination();
                $dm->name = $denomination;
                $dm->save();
                $i++;
            }
        }

        echo "$i denominazioni inserite";
    }

}
