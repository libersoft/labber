<?php

abstract class PluginSampleTable extends Doctrine_Table
{
  /**
   * Genera un numero univoco per i campioni.
   *
   * @param int $timestamp Il timestamp di accettazione dell'ordine
   */
  public static function nextInternalNumber($timestamp)
  {
    // Disabilita temporaneamente le DQL callback che filtrano
    // automaticamente i Sample softdeletati
    Doctrine_Manager::getInstance()->setAttribute(Doctrine_Core::ATTR_USE_DQL_CALLBACKS, false);

    // Conta i campioni di ordini accettati nell'anno di accettazione
    $q = Doctrine::getTable('Sample')
      ->createQuery('s')
      ->leftJoin('s.Order o')
      ->where('s.bozza = 0')
      ->andWhere('o.accepted_at >= ?', date('Y-m-d H:i', mktime(0, 0, 0, 1, 1, date('Y', $timestamp))))
      ->andWhere('o.accepted_at < ?', date('Y-m-d H:i', mktime(0, 0, 0, 1, 1, date('Y', $timestamp) + 1)));

    $count = $q->count() + 1;

    do
    {
      $number = sprintf(sfConfig::get('app_businesslogic_sample_number_format'), date('y', $timestamp), $count++);
    }
    while ($q->andWhere('s.numero = ?', $number)->fetchOne());

    return $number;
  }
}
