<?php

/**
 * Sample tests.
 */
include dirname(__FILE__).'/../../../../../../test/bootstrap/Doctrine.php';

$databaseManager = new sfDatabaseManager($configuration);

$t = new lime_test(1);

$t->comment('::nextInternalNumber()');
$t->is(SampleTable::nextInternalNumber(time()), date('y') . '-000001', 'formato numero campione YY-00000X');
