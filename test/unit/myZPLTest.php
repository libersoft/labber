<?php

include dirname(__FILE__).'/../bootstrap/unit.php';
require_once dirname(__FILE__).'/../../apps/labber/lib/myZPL.class.php';

$t = new lime_test(1);

$t->comment('a test');

$zpl = new myZPL(70, 20, 26, 14);
$zpl->write("cc");
$zpl->write("ia");
$zpl->write("oo");
$output = $zpl->commit();

$output1 = <<<EOF
^XA
^LT-30
^FO70,20^ADN,26,14^FDcc^FS
^FO70,34^ADN,26,14^FDia^FS
^FO70,48^ADN,26,14^FDoo^FS
^XZ
EOF;

if (strcmp($output,$output1) == 0) $t->pass('first test OK!');
else $t->fail($output."\n".$output1);

?>
