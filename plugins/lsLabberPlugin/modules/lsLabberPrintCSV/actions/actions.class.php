<?php

/**
 * order actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberPrintCSV
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action printcsv
 */
class lsLabberPrintCSVActions extends sfActions
{

  /**
   * Produce un CSV di un dettaglio ordine
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executePrintOrderDetail(sfWebRequest $request)
  {
    try
    {
      // Array che conterrà tutti i file creati
      $array_order = array();
      //Indice utile per inserire gli oggetti correttamente in $array_order
      $i_order = 0;
      $keys = $request->getParameter('keys');
      $orderID = $request->getParameter('orderID');
      if ($keys[1] == null)
      {
        $keys[0] = $orderID;
      }
      foreach ($keys as $order_id)
      {
        $order = Doctrine::getTable('Order')->find($order_id);
        $samples = $order->getSamples();
        $contact = Doctrine::getTable('Contact')->find($order->contact_id);

        $file_name = 'Dettaglio_Ordine_' . $order->numero . '.csv';
        $path = sfConfig::get('app_path_order_detail');
        $fp = fopen($path . $file_name, 'w');
        $array_order[$i_order] = $file_name;
        $i_order++;

        $orderDetail = array(
          'contactname' => $contact->name,
          'contactaddress' => $contact->address,
          'cap' => $contact->cap,
          'city' => $contact->city,
          'pr' => $contact->province,
          'fax' => $contact->fax,
          'tel' => $contact->telephone,
          'mail' => $contact->email,
          'ordn' => $order->numero,
        );

        fputcsv($fp, $orderDetail);

        foreach ($samples as $sample)
        {
          fputcsv($fp, array($sample->numero));

          $determinations = $sample->getDeterminations();

          foreach ($determinations as $d)
          {
            $samplesDetail = array();
            // Se è presente l'alias della denomination nel limite associata al limite la visualizzo
            if ($d->denomination_alias == '')
            {
              $samplesDetail[] = $d->getDenomination()->name;
            }
            else
            {
              $samplesDetail[] = $d->getDenomination()->name . ' (' . $d->denomination_alias . ')';
            }
            $samplesDetail[] = $d->getMethod()->name;
            fputcsv($fp, $samplesDetail);
          }
        }
        fclose($fp);
      }
      $this->result = array(
        'success' => true,
        'res' => 1,
        'count' => $i_order,
        'order' => $array_order
      );
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

}