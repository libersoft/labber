<?php

/**
 * determination actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberDetermination
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action determination
 */
class lsLabberDeterminationActions extends sfActions
{
  /**
   * Lista delle sezioni/pacchetti monometodo
   * con filtro per matrice compatibile
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeProtoList(sfWebRequest $request)
  {
    $protoType = $request->getParameter('prototype');           // può essere 'Packet' o 'OfferSection'
    $protoToString = $protoType == 'Packet' ? 'name' : 'title'; // l'attributo descrittivo della classe

    $limit = $request->getParameter('limit', 15);
    $page = ($request->getParameter('start', 0)/$limit)+1;
    $dir = $request->getParameter('dir', 'ASC');

    $column = $request->getParameter('sort', $protoToString);
    if ($column == 'desc')
    {
      $column = $protoToString;
    }

    $q = Doctrine_Query::create()
      ->from($protoType . ' p')
      ->leftJoin('p.Determinations dd')
      ->leftJoin('dd.Method m')
      ->leftJoin('m.Matrixes mm')
      ->where('p.is_proto = 1');

    try
    {
      if ($protoType == 'OfferSection')
      {
        $q->andWhere('p.offer_id = ?', $request->getParameter('offerid'));
      }

      # conditions for sorting
      if (Doctrine::getTable($protoType)->hasColumn($column))
      {
        $q->orderBy(sprintf('p.%s %s', Doctrine::getTable($protoType)->getFieldName($column), $dir));
      }

      if ($request->hasParameter('matrix_id'))
      {
        // filtra per le sottomatrici
        $ids = Doctrine::getTable('Matrix')->find($request->getParameter('matrix_id'))->getChildIds();
        $ids[] = $request->getParameter('matrix_id');  // aggiungi la matrice stessa
        $q->andWhereIn('mm.matrix_id', $ids);
      }

      if ($request->hasParameter('submatrix_id'))
      {
        // limita il filtro al percorso matrix <-> submatrix
        $ids = Doctrine::getTable('Matrix')->find($request->getParameter('submatrix_id'))->getParentIds();
        $ids[] = $request->getParameter('submatrix_id');  // aggiungi la matrice stessa
        $q->andWhereIn('mm.matrix_id', $ids);
      }

      # object responsible for paging
      $pager = new sfDoctrinePager($protoType, $limit);

      $pager->setQuery($q);
      $pager->setPage($page);
      $pager->init();

      $data = array();

       # format result array
      foreach ($pager->getResults() as $r)
      {
        $p = array();
        $p['id'] = $r['id'];
        $p['desc'] = $r[$protoToString];
        $p['method'] = $r->Determinations[0]->Method->name;

        // Lista delle singole denominazioni separate da virgola
        $p['inside'] = '';

        foreach ($r->Determinations as $i => $d)
        {
          $i !== 0 && $p['inside'] .= ', ';
          $p['inside'] .= $d->Denomination->name;
        }

        $data[] = $p;
      }

      $this->result = array(
        'success' => true,
        'data'    => $data,
        'total'   => $pager->getNbResults()
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
   * Valorizzazione di una sezione/pacchetto semplice
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeProto(sfWebRequest $request)
  {
    $data = $request->getParameter('data');

    // Ottieni i controlli del pacchetto in ordine di numriga_report
    $q = Doctrine_Query::create()
      ->from('Determination d')
      ->where('d.' . ($data->prototype === 'Packet' ? 'packet_id' : 'offer_section_id') . ' = ?', $data->proto_id)
      ->orderBy('d.numriga_report');

    try
    {
      $determinations = $q->execute();
      $count = $q->count();

      foreach ($determinations as $determination)
      {
        $success = $this->caoduro($determination, $data->matrix_id, $data->record_local, $data->record_id, $data->prototype);

        if ($success)
        {
          $count--;
        }
      }

      // Associa sezione di offerta al ProtoPacket in OfferSectionSource
      if ($data->prototype === 'Packet' && $data->record_local === 'offer_section_id')
      {
        $source = new OfferSectionSource();
        $source->offer_section_id = $data->record_id;
        $source->packet_id = $data->proto_id;
        $source->save();
      }

      $proto = Doctrine::getTable($data->prototype)->find($data->proto_id);
      $protoName = $data->prototype == 'Packet' ? $proto->name : $proto->title;

      $result = array(
        'success' => true,
        'message' => $count == 0 ? $protoName . ' correttamente valorizzato' : 'Non tutti i controlli di ' . $protoName . ' sono stati associati alla matrice scelta',
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

  private function caoduro($determination, $matrix_id, $record_local, $record_id, $prototype)
  {
    $q = Doctrine_Query::create()
      ->from('DeterminationType dt')
      ->where('dt.matrix_id = ?', $matrix_id)
      ->andWhere('dt.denomination_id = ?', $determination->denomination_id)
      ->andWhere('dt.method_id = ?', $determination->method_id);

    if ($dt = $q->fetchOne())
    {
      $d = new Determination();
      $d->set($record_local, $record_id);
      $d->set('denomination_id', $dt->denomination_id);
      $d->set('matrix_id', $dt->matrix_id);
      $d->set('method_id', $dt->method_id);
      $d->set('scale_id', $dt->scale_id);
      $d->set('um_id', $dt->um_id);
      $d->set('cifre_decimali', $dt->max_decimal_digits);
      $d->set('cifre_significative', $dt->significant_digits);
      $d->set('price', $dt->price);

      // TODO: setta i valori di default dei parametri associati.
      $sinalDetermination = true;
      foreach ($dt->getFields() as $field)
      {
        if ($field->is_default)
        {
          $params = array($field->getFieldType()->name => $field->value);
          $d->set('params', json_encode($params));
          $sinalDetermination = $sinalDetermination && $field->is_sinal;
        }
      }
      $d->set('is_sinal', $sinalDetermination && $dt->is_sinal);

      // TODO: generalizzare
      if ($prototype == 'Packet')
      {
        $d->set('origine', $determination->getPacket()->name);
        $d->set('rdp_title', $determination->getPacket()->report_title);

        // Setta il JSON 'source' per l'indicazione dell'origine di
        // questa Determination ai fini della fatturazione
        $source = array(
          'table' => 'Packet',
          'id'    => $determination->packet_id
        );
        $d->set('source', json_encode($source));
      }

      // Imposta la "Data inizio" del controllo nel campione ad oggi
      if ($record_local == 'sample_id')
      {
        $d->set('data_inizio', date('Y-m-d', time()));
      }

      $d->save();
      return true;
    }
    else
    {
      $matrix = Doctrine::getTable('Matrix')->find($matrix_id);

      if ($matrix->parent_id)
      {
        return $this->caoduro($determination, $matrix->parent_id, $record_local, $record_id, $prototype);
      }
      else
      {
        return false;
      }
    }
  }

  /**
   * Salva l'ordine delle Determination di un Sample
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeSaveOrder(sfWebRequest $request)
  {
    $orderInfo = $request->getParameter('orderInfo');

    foreach ($orderInfo as $info)
    {
      $d = Doctrine::getTable('Determination')->find($info->id);
      $d->set('numriga_report', ($info->index + 1) * 10);
      $d->save();
    }

    $this->result = array(
      'success' => true
    );

    return sfView::SUCCESS;
  }

  /**
   * Lista delle determination nel Laboratorio
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeLabList(sfWebRequest $request)
  {
    $data = array();

    try
    {
      $q = Doctrine_Core::getTable('Determination')->getLabDeterminations();

      // per la FilteringToolbar
      if ($request->hasParameter('filters'))
      {
        $filters = $request->getParameter('filters');
        foreach ($filters as $filter)
        {
          $q->andWhere(sprintf('%s %s ?', $filter->field, $filter->operator), $filter->value);
        }
      }

      foreach ($q->execute() as $d)
      {
        $data[] = $d->toLabArray();
      }

      $this->result = array(
        'success' => true,
        'data'    => $data,
        'total'   => $q->count()
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
   * Salva una modifica su un controllo fatta in laboratorio.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeLabUpdate(sfWebRequest $request)
  {
    $data = $request->getParameter('data');

    try
    {
      $q = Doctrine_Core::getTable('Determination')
        ->getLabDeterminations()
        ->andWhere('id = ?', $data->id);

      $d = $q->fetchOne();

      unset($data->id);
      foreach ($data as $k => $v)
      {
        $d->set($k, $v);
      }
      $d->save();

      $this->result = array(
        'success' => true,
        'data'    => $d->toLabArray()
      );
    }
    catch (Exception $e)
    {
      $this->result = array(
        'success' => false,
        'message' => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
        'trace'   => $e->getTrace()
      );
    }

    return sfView::SUCCESS;
  }

  /**
   * Applica i limiti
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeSetLimits(sfWebRequest $request)
  {
    $conn = Doctrine_Manager::connection();

    // TODO: generalizzare
    if ($request->getParameter('recordLocal') === 'sample_id')
    {
      $sample = Doctrine::getTable('Sample')->find($request->getParameter('recordID'));
      $sample->limits_group_id = $request->getParameter('limitsGroupID');
      $sample->save($conn);
    }

    $sql = 'update determination d left join limit_table l on d.denomination_id = l.denomination_id set d.limiti = l.value, d.denomination_alias = l.denomination_alias where d.um_id = l.unit_id and d.'.$request->getParameter('recordLocal').' = ? and l.group_id = ?;';
    $rows = $conn->execute($sql, array($request->getParameter('recordID'), $request->getParameter('limitsGroupID')));
    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }

  /**
   * Copia le Determination di una OfferSection in un Sample
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeAddFromOfferSection(sfWebRequest $request)
  {
    $sampleId = $request->getParameter('recordId');
    $values   = $request->getParameter('values');

    $offerSection = Doctrine::getTable('OfferSection')->find($values->offer_section_id);

    try
    {
      // Copia il dettaglio prezzi nel campione
      foreach ($offerSection->getSource() as $oss)
      {
        $ss = new SampleSource();
        $ss->set('sample_id', $sampleId);
        $ss->set('packet_id', $oss->packet_id);
        $ss->set('determination_id', $oss->determination_id);
        $ss->set('price', $oss->price);
        $ss->save();
      }

      // Copia i controlli contenuti nell'OfferSection e li assegna
      // al Sample
      foreach ($offerSection->getDeterminations() as $determination)
      {
        $determinationCopy = $determination->copy();
        $determinationCopy->set('offer_section_id', null);
        $determinationCopy->set('sample_id', $sampleId);

        // Se la OfferSection ha specificato un numero di giorni, il
        // valore viene sommato alla data odierna e genera la data
        // di scadenza del controllo.
        if ($offerSection->days)
        {
          $determinationCopy->set('data_scadenza', date('Y-m-d', strtotime(sprintf('+%s days', $offerSection->days))));
        }

        // Setta il JSON 'source' per l'indicazione dell'origine di
        // questa Determination ai fini della fatturazione
        $source = array(
          'table' => 'OfferSection',
          'id'    => $values->offer_section_id
        );
        $determinationCopy->set('source', json_encode($source));

        // Imposta la "Data inizio" del controllo ad oggi
        $determinationCopy->set('data_inizio', date('Y-m-d', time()));

        $determinationCopy->set('created_at', date('Y-m-d h:i:s', time()));
        $determinationCopy->set('updated_at', date('Y-m-d h:i:s', time()));
        $determinationCopy->save();

        // Associa la nuova Determination nel dettaglio prezzi
        if ($determination->getRelatedSource())
        {
          $ss = Doctrine::getTable('SampleSource')
            ->createQuery('ss')
            ->where('ss.sample_id = ?', $sampleId)
            ->andWhere('ss.determination_id = ?', $determination->id)
            ->fetchOne();

          $ss->set('determination_id', $determinationCopy->id);
          $ss->save();
        }
      }

      // Imposta il prezzo del Sample a quello dell'OfferSection
      $sample = Doctrine::getTable('Sample')->find($sampleId);
      $sample->setPrice($offerSection->price);
      $sample->save();

      $result = array(
        'success' => true,
        'message' => 'Controlli inseriti correttamente.',
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
   * Azzera i risultati dei controlli non valorizzati
   *
   *  @extdirect-enable
   *  @extdirect-len 1
   */
  public function executeZero()
  {
    $sampleId = $this->getRequestParameter('sampleId');
    $methodId = $this->getRequestParameter('methodId');
    
    $q = Doctrine_Query::create()
      ->from('Determination')
      ->where('valore_inserito IS NULL')
      ->andWhere('sample_id', $sampleId)
      ->andWhere('method_id', $methodId);

    foreach ($q->execute() as $determination)
    {
      $determination->set('valore_inserito', 0);
      $determination->set('risultato_formattato', 0);
      $determination->save();
    }

    $this->result = array('success' => true, 'debug' => $rows);
    return sfView::SUCCESS;
  }

  /**
   * Aggiunge, copiandole, le determinazioni contenute in un
   * pacchetto ad un altro pacchetto o ad un campione, preservando
   * l'indicazione del pacchetto di provenienza in quest'ultimo caso.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeAdd(sfWebRequest $request)
  {
    $recordId = $request->getParameter('recordId');
    // può essere 'sample_id' o 'packet_id'
    $recordLocal = $request->getParameter('recordLocal');

    $values = $request->getParameter('values');
    $sourcePacket = Doctrine::getTable('Packet')->find($values->packet_id);

    try
    {
      // copia i controlli dei sottopacchetti
      foreach ($sourcePacket->getChildren() as $packet)
      {
        $packet->copyDeterminations($recordLocal, $recordId, $sourcePacket->name);
      }

      // ed eventuali controlli inseriti singolarmente nel pacchetto
      $sourcePacket->copyDeterminations($recordLocal, $recordId);

      $result = array(
        'success' => true,
        'message' => 'Controlli inseriti correttamente.'
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
}
