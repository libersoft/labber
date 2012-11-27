<?php

/**
 * PluginDetermination tests.
 */
include dirname(__FILE__).'/../../../../../../test/bootstrap/Doctrine.php';

sfContext::createInstance($configuration);

Doctrine_Manager::getInstance()->setAttribute(Doctrine_Core::ATTR_USE_DQL_CALLBACKS, true);

$t = new lime_test(14);

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

$t->comment('->isComply()');
$d = $determinationDouble;
$d->valore_inserito = 7.1;

$d->limiti = "<6.4";
$t->ok(!$d->isComply(), 'limite singolo KO');

$d->limiti = ">6";
$t->ok($d->isComply(), 'limite singolo OK');

$d->limiti = "<2\r\n>1";
$t->ok(!$d->isComply(), 'intervallo limiti KO');

$d->limiti = ">6\r\n<8";
$t->ok($d->isComply(), 'intervallo limiti OK');

$d->limiti = "<2\n>1";
$t->ok(!$d->isComply(), 'intervallo (LF) limiti KO');

$d->limiti = ">6\n<8";
$t->ok($d->isComply(), 'intervallo (LF) limiti OK');

$d->limiti = "Assenti";
$t->ok(!$d->isComply(), 'P/A KO');

$d->valore_inserito = 0;
$t->ok($d->isComply(), 'P/A OK');
$determinationDouble->delete();

$t->comment('->preUpdate()');
$det = create_determination();
$det->save();
$det->valore_inserito = 0.5;
$det->save();
$t->is($det->data_fine, date('Y-m-d'), 'data di fine analisi (prima valorizzazione)');
$t->is($det->risultato_formattato, '<0.60', 'valore < LOQ');
$det->valore_inserito = 1.1;
$det->save();
$t->is($det->risultato_formattato, 1.10, 'cifre decimali e significative');

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
    'params'          => json_encode(array('LOQ' => '0.60'))
  ), $defaults));

  return $determination;
}
