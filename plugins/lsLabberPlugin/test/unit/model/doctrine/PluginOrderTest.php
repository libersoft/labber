<?php

/**
 * Order tests.
 */
include dirname(__FILE__).'/../../../../../../test/bootstrap/Doctrine.php';

$databaseManager = new sfDatabaseManager($configuration);

$t = new lime_test(1);

$t->comment('::nextInternalNumber()');
$t->is(OrderTable::nextInternalNumber(), date('y') . '-0001', 'formato numero ordine YY-000X');
