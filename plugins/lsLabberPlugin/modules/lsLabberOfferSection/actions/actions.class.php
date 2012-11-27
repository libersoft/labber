<?php

/**
 * OfferSection actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberOfferSection
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action offerSection
 */
class lsLabberOfferSectionActions extends sfActions
{
  /**
   * Ritorna il dettaglio dei prezzi di una sezione d'offerta.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executePriceList(sfWebRequest $request)
  {
    $sources = array();

    try
    {
      $q = Doctrine::getTable('OfferSectionSource')
        ->createQuery('s')
        ->leftJoin('s.Determination det')
        ->leftJoin('det.Denomination den')
        ->leftJoin('s.Packet p')
        ->leftJoin('s.OfferSection os')
        ->where('s.offer_section_id = ?', $request->getParameter('sectionId'));

      foreach ($q->execute() as $source)
      {
        $sources[] = $source->toPriceArray();
      }

      $this->result = array(
        'success' => true,
        'total'   => $q->count(),
        'data'    => $sources
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }
  }

  /**
   * Aggiorna il dettaglio dei prezzi di una sezione d'offerta.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executePriceUpdate(sfWebRequest $request)
  {
    try
    {
      $data = $request->getParameter('data');
      $source = Doctrine::getTable('OfferSectionSource')->find($data->id);
      $source->setPrice($data->price);
      $source->save();

      $this->result = array(
        'success' => true,
        'data'    => $source->toPriceArray()
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

  /**
   * Salva il prezzo di una sezione d'offerta.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeStorePrice(sfWebRequest $request)
  {
    try
    {
      $record = Doctrine::getTable('OfferSection')->find($request->getParameter('id'));
      $record->setPrice($request->getParameter('price'));
      $record->save();

      $result = array(
        'success' => true,
        'message' => sprintf("%s prezzata a %s €", $record->title, str_replace('.', ',', $record->price))
      );
    }
    catch (Exception $e)
    {
      $result = array(
        'success' => false,
        'message' => $e->getMessage(),
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Elimina un dettaglio dei prezzi di una sezione d'offerta.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executePriceDestroy(sfWebRequest $request)
  {
    try
    {
      if (!$request->hasParameter('data'))
      {
        throw new Exception("Missing 'data' parameter");
      }

      if (!Doctrine::getTable('OfferSectionSource')->find($request->getParameter('data'))->delete())
      {
        throw new Exception('Delete unsuccessful');
      }

      $this->result = array(
        'success' => true,
        'data'    => array(),
      );
    }
    catch (Exception $e)
    {
      $this->result = array(
        'success' => false,
        'message' => $e->getMessage(),
      );
    }

    return sfView::SUCCESS;
  }

  /**
   * Crea un dettaglio dei prezzi di una sezione d'offerta.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executePriceCreate(sfWebRequest $request)
  {
    try
    {
      if (!$request->hasParameter('data'))
      {
        throw new Exception("Missing 'data' parameter");
      }

      $data = $request->getParameter('data');

      if (!isset($data->record_id) ||
          !(isset($data->determination_id) || isset($data->packet_id)))
      {
        throw new Exception("Malformed data");
      }

      $data->offer_section_id = $data->record_id;
      unset($data->record_id);

      $oss = new OfferSectionSource();
      $oss->merge((array) $data);
      $oss->save();

      $this->result = array(
        'success' => true,
        'data'    => $oss->identifier(),
      );
    }
    catch (Exception $e)
    {
      $this->result = array(
        'success' => false,
        'message' => $e->getMessage(),
      );
    }

    return sfView::SUCCESS;
  }
}
