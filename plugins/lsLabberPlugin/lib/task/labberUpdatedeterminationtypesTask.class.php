<?php

class labberUpdatedeterminationtypesTask extends sfBaseTask
{
  protected function configure()
  {
    // // add your own arguments here
    // $this->addArguments(array(
    //   new sfCommandArgument('my_arg', sfCommandArgument::REQUIRED, 'My argument'),
    // ));

    $this->addOptions(array(
      new sfCommandOption('application', null, sfCommandOption::PARAMETER_REQUIRED, 'The application name'),
      new sfCommandOption('env', null, sfCommandOption::PARAMETER_REQUIRED, 'The environment', 'dev'),
      new sfCommandOption('connection', null, sfCommandOption::PARAMETER_REQUIRED, 'The connection name', 'doctrine'),
      // add your own options here
      new sfCommandOption('next-id', null, sfCommandOption::PARAMETER_OPTIONAL, 'L\'id del Method da cui partire con la rigenerazione', 1),
    ));

    $this->namespace        = 'labber';
    $this->name             = 'update-determination-types';
    $this->briefDescription = 'Aggiorna le DeterminationType di tutti i Method';
    $this->detailedDescription = <<<EOF
"Rigenerazione Globale"®
EOF;
  }

  protected function execute($arguments = array(), $options = array())
  {
    // initialize the database connection
    $databaseManager = new sfDatabaseManager($this->configuration);
    $connection = $databaseManager->getDatabase($options['connection'])->getConnection();

    // add your code here
    $methods = Doctrine::getTable('Method')->findAll();
    $this->log($methods->count() . ' metodi nel database.');

    $start_time = time();
    foreach ($methods as $i => $method)
    {
      if ($method->id >= $options['next-id'])
      {
        $this->log('Tocca a '.$method->name.'! (#'.$method->id.')');
        $method->updateDeterminationTypes();
      }
    }

    $time = time() - $start_time;
    $this->log('Sono passati in tutto ' . $time . ' secondi! FINITO!');
  }
}
