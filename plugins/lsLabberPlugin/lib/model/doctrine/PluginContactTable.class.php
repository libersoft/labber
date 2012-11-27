<?php


abstract class PluginContactTable extends Doctrine_Table
{

  public static function getInstance()
  {
    return Doctrine_Core::getTable('Contact');
  }

  /*
   * Restituisce i contatti attivi
   */
  public function retrieveContacts(Doctrine_Query $q)
  {
    $rootAlias = $q->getRootAlias();
    return $q;
  }
}