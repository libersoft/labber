<?php

abstract class PluginOrderTable extends Doctrine_Table
{
  public static function nextInternalNumber()
  {
    // Disabilita temporaneamente le DQL callback che filtrano
    // automaticamente gli Order softdeletati
    Doctrine_Manager::getInstance()->setAttribute(Doctrine_Core::ATTR_USE_DQL_CALLBACKS, false);

    $count = Doctrine::getTable('Order')
      ->createQuery('s')
      ->where('s.bozza = 0')
      ->andWhere('s.accepted_at > ?', date('Y-m-d H:i', mktime(0, 0, 0, 1, 1, date('Y'))))
      ->count();

    return sprintf(sfConfig::get('app_businesslogic_order_number_format'), date('y'), $count + 1);
  }
}
