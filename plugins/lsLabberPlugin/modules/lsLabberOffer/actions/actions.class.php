<?php

/**
 * offer actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberOffer
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action offer
 */
class lsLabberOfferActions extends sfActions
{
  /**
   * Copia una sezione d'offerta.
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executeCopySection(sfWebRequest $request)
  {
    try
    {
      $section = Doctrine::getTable('OfferSection')->find($request->getParameter('offer_section_id'));

      $sectionClone = $section->copy();
      $sectionClone->save();

      $a = array();  // tiene traccia dei nuovi determination_id

      foreach ($section->getDeterminations() as $determination)
      {
        $determinationClone = $determination->copy();
        $determinationClone->offer_section_id = $sectionClone->id;
        $determinationClone->save();

        $a[$determination->id] = $determinationClone->id;
      }

      // copia anche il dettaglio prezzi
      foreach ($section->getSource() as $source)
      {
        $sourceClone = $source->copy();
        $sourceClone->offer_section_id = $sectionClone->id;

        // aggiorna determination_id a quello della nuova determinazione
        // clonata
        if ($sourceClone->determination_id)
        {
          $sourceClone->set('determination_id', $a[$sourceClone->determination_id]);
        }

        $sourceClone->save();
      }

      $result = array(
        'success' => true,
        'message' => 'Sezione copiata correttamente'
      );
    }
    catch (Exception $exc)
    {
      $result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Copia un'offerta
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executeCopy(sfWebRequest $request)
  {
    $data = $request->getParameter('data');

    try
    {
      $sourceOffer = Doctrine::getTable('Offer')->find($data->sourceoffer_id);

      $newOffer = $sourceOffer->copy();
      $newOffer->contact_id = $data->client_id;
      $newOffer->save();

      foreach ($sourceOffer->getOfferSections() as $section)
      {
        $newSection = $section->copy();
        $newSection->offer_id = $newOffer->id;
        $newSection->save();

        foreach ($section->getDeterminations() as $determination)
        {
          $newDetermination = $determination->copy();
          $newDetermination->offer_section_id = $newSection->id;
          $newDetermination->save();
        }
      }

      $result = array(
        'success' => true,
        'message' => 'Offerta copiata correttamente'
      );
    }
    catch (Exception $exc)
    {
      $result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Ritorna gli eventi di un giorno o una settimana
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfWebRequest $request
   * @return <type>
   */
  public function executeStorePrice(sfWebRequest $request)
  {
    try
    {
      $id = $request->getParameter('id');
      $price = $request->getParameter('price');
      $class = $request->getParameter('table');
      $record = Doctrine::getTable($class)->find($id);
      $record->set('price', $price);
      $record->save();

      $result = array(
        'success' => true
      );
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
    // ritorno
    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Ritorna l'elenco delle offerte create
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfWebRequest $request
   * @return <type>
   */
  public function executeList(sfWebRequest $request)
  {
    try
    {
      $q = Doctrine_Query::create()->from('Offer');

      if ($request->hasParameter('doctrineJoins'))
      {
        $joins = $request->getParameter('doctrineJoins');
        foreach ($joins as $join)
        {
          $q->leftJoin($join);
        }
      }

      if ($request->hasParameter('filters'))
      {
        $filters = $request->getParameter('filters');
        foreach ($filters as $filter)
        {
          $q->andWhere(sprintf('%s %s ?', $filter->field, $filter->operator), $filter->value);
        }
      }
      $offer = $q->execute();
      // dati da inserire nella griglia
      $data = array();
      $i = 0;
      // singola riga della griglia
      $record = array();

      foreach ($offer as $of)
      {
        if ($of->revision_number != null)
        {
          $history = json_decode($of->history);
          for ($j = 0; $j <= $of->revision_number; $j++)
          {
            $k = 0;
            while ($k <= count($history)){
              if ($history[$k]->value == $j){
                $timestamp = $history[$k]->timestamp;
                $k = count($history)+1;
              }
              else {
                $k++;
              }
            }
            $record['name'] = $of->number;
            $record['revision'] = $j;
            $record['description'] = $of->name;
            $record['contact'] = $of->getContact()->name;
            $record['contactid'] = $of->getContact()->id;
            $record['attach'] = 'Offerta_' . $of->number . '_rev_' . $j . '.odt';
            $record['date_rev'] = date ( 'd/m/Y H:i:s' , $timestamp);
            $data[$i] = $record;
            $i++;
          }
        }
      }
      $result = array(
        'success' => true,
        'data' => $data,
      );
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

    // ritorno
    $this->result = $result;
    return sfView::SUCCESS;
  }

}
