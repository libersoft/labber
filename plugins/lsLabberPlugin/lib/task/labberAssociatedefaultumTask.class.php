<?php

class labberAssociatedefaultumTask extends sfBaseTask
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
    ));

    $this->namespace        = 'labber';
    $this->name             = 'associate-default-um';
    $this->briefDescription = '';
  }

  protected function execute($arguments = array(), $options = array())
  {
    // initialize the database connection
    $databaseManager = new sfDatabaseManager($this->configuration);
    $connection = $databaseManager->getDatabase($options['connection'])->getConnection();

    // add your code here
    $methods = Doctrine::getTable('Method')->findAll();
    $mumTable = Doctrine::getTable('MethodUnitOfMeasurement');

    // rimuovi i default prima di riscriverli
    $mumTable->findBy('is_default', true)->delete();

    foreach ($methods as $i => $method)
    {
      if ($method->um_id)
      {
        $mum = new MethodUnitOfMeasurement();
        $mum->method_id = $method->id;
        $mum->prefix_id = $method->prefix_id;
        $mum->unit_of_measurement_id = $method->um_id;
        $mum->is_default = true;
        $mum->save();
      }
    }
  }
}
