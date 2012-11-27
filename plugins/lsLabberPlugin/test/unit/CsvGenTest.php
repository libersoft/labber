<?php

/**
 * PluginDetermination tests.
 */
include dirname(__FILE__).'/../../../../../../test/bootstrap/Doctrine.php';

$databaseManager = new sfDatabaseManager($configuration);

$t = new lime_test(3);

$t->comment('->save()');
$determination = create_determination();
$determination->save();
$determinationDouble = create_determination();
try
{
  $determinationDouble->save();
  $t->fail('qui avrebbe dovuto dare eccezione!');
}
catch (Exception $exc)
{
  $t->pass('unique!');
}

$determination->delete();
try
{
  $determinationDouble->save();
  $t->pass('ora puoi salvare!');
}
catch (Exception $exc)
{
  $t->fail($exc);
}
$t->is(Doctrine::getTable('Determination')->count(), 1, 'oh yeah!');

function create_determination($defaults = array())
{
  static $packet = null, $denomination = null, $method = null;

  if (is_null($packet))
  {
    $packet = Doctrine_Core::getTable('Packet')
      ->createQuery()
      ->limit(1)
      ->fetchOne();
  }

  if (is_null($denomination))
  {
    $denomination = Doctrine_Core::getTable('Denomination')
      ->createQuery()
      ->limit(1)
      ->fetchOne();
  }

  if (is_null($method))
  {
    $method = Doctrine_Core::getTable('Method')
      ->createQuery()
      ->limit(1)
      ->fetchOne();
  }

  $determination = new Determination();
  $determination->fromArray(array_merge(array(
    'packet_id'       => $packet->getId(),
    'denomination_id' => $denomination->getId(),
    'method_id'       => $method->getId(),
    'params'          => json_encode(array())
  ), $defaults));

  return $determination;
}
