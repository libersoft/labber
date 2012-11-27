<?php

/**
 * order actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberOrder
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action order
 */
class lsLabberOrderActions extends sfActions
{

  /**
   * Sbozza un ordine
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeSbozza(sfWebRequest $request)
  {
    $order = Doctrine::getTable('Order')->find($request->getParameter('orderId'));
    try
    {
      $order->sbozza();
      $this->result = array('success' => true);
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    return sfView::SUCCESS;
  }

  public function executePrintLabel(sfWebRequest $request)
  {
    $orderID = $request->getParameter('orderID');

    header('Content-type: text/plain');
    header('Content-Disposition: attachment; filename="test.zpl"');

    $zpl = new myZPL(70, 20, 26, 14);
    $order = Doctrine::getTable('Order')->find($orderID);

    $zpl->writeEan13(($order->numero));

    echo $zpl->commit();


    return sfView::NONE;
  }
}
