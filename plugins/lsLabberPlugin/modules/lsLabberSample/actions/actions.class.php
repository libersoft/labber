<?php

/**
 * Sample actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberSample
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action sample
 */
class lsLabberSampleActions extends sfActions
{
  /**
   * Recupera le Determination di un Sample ordinate per numriga_report
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executeGetOrderedDeterminations(sfWebRequest $request)
  {
    $raw = $request->getParameter('_raw');

    $q = Doctrine_Query::create()
        ->from('Determination d')
        ->leftJoin('d.Denomination')
        ->where('d.sample_id = ?', $raw[0])
        ->orderBy('d.numriga_report');

    $this->result = array();

    foreach ($q->execute() as $determination)
    {
      $node = array();
      $node['id'] = $determination->id;
      $node['text'] = $determination->Denomination->name;
      $node['leaf'] = true;
      $this->result[] = $node;
    }

    return sfView::SUCCESS;
  }

  /**
   * Copia i campioni.
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executeCopy(sfWebRequest $request)
  {
    try
    {
      $values = $request->getParameter('values');

      $sample = Doctrine::getTable('Sample')->find($values->sample_id);

      for ($i = 0; $i < $values->numero; $i++)
      {
        // Controllo se devo copiare tutta la descrizione del campione altrimenti crea un nuovo campione con solo l'order_id
        if ($values->descrizione)
        {
          $sampleClone = $sample->copy();
          $sampleClone->set('numero', null);
          $sampleClone->set('bozza', 1);
          $sampleClone->set('created_at', null);
          $sampleClone->set('updated_at', null);
        }
        else
        {
          $sampleClone = new Sample();
          $sampleClone->set('order_id', $sample->order_id);
        }

        $sampleClone->save();

        // Verifico se devo copiare i controlli o meno
        if ($values->controlli)
        {
          foreach ($sample->getDeterminations() as $determination)
          {
            $determinationClone = $determination->copy();
            $determinationClone->set('sample_id', $sampleClone->id);
            $determinationClone->set('created_at', null);
            $determinationClone->set('updated_at', null);

            if (!$values->risultati)
            {
              $determinationClone->set('valore_inserito', null);
              $determinationClone->set('risultato_formattato', null);
            }

            $determinationClone->save();
          }
        }
      }

      $result = array('success' => true);
    }
    catch (Exception $e)
    {
      $result = array(
        'success' => false,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTrace()
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Ritorna il dettaglio dei prezzi di un campione.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executePriceList(sfWebRequest $request)
  {
    $sources = array();

    try
    {
      $q = Doctrine::getTable('SampleSource')
        ->createQuery('ss')
        ->leftJoin('ss.Determination det')
        ->leftJoin('det.Denomination den')
        ->leftJoin('ss.Packet p')
        ->leftJoin('ss.Sample s')
        ->where('ss.sample_id = ?', $request->getParameter('sampleId'));

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
   * Aggiorna il dettaglio dei prezzi di un campione.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executePriceUpdate(sfWebRequest $request)
  {
    try
    {
      $data = $request->getParameter('data');
      $source = Doctrine::getTable('SampleSource')->find($data->id);
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
   * Elimina un dettaglio dei prezzi di un campione.
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

      if (!Doctrine::getTable('SampleSource')->find($request->getParameter('data'))->delete())
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
   * Crea un dettaglio dei prezzi di un campione.
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

      $data->sample_id = $data->record_id;
      unset($data->record_id);

      $ss = new SampleSource();
      $ss->merge((array) $data);
      $ss->save();

      $this->result = array(
        'success' => true,
        'data'    => $ss->identifier(),
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
