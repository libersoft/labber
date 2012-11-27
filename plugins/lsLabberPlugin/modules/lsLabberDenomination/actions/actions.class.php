<?php

/**
 * Denomination actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberDenomination
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action denomination
 */
class lsLabberDenominationActions extends sfActions
{
  /**
   * Restituisce un array di oggetti collegati ad una denominazione.
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executeGetRelations(sfWebRequest $request)
  {
    try
    {
      $denomination = Doctrine::getTable('Denomination')
        ->createQuery('d')
        ->leftJoin('d.Methods m')
        ->leftJoin('d.Limits l')
        ->leftJoin('l.Group g')
        ->where('d.id = ?', $request->getParameter('id'))
        ->fetchOne();

      $data = array();

      foreach ($denomination->getMethods() as $method)
      {
        $data[] = array(
          'class' => 'Metodo',
          'name' => $method->getName()
        );
      }

      foreach ($denomination->getLimits() as $limit)
      {
        $data[] = array(
          'class' => 'Tabella limiti',
          'name'  => $limit->getGroup()->getName()
        );
      }

      $this->result = array(
        'success' => true,
        'data'    => $data
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
   * Ricerca per alias e ritorna a una ComboBox.
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeAliasFilter(sfWebRequest $request)
  {
    try
    {
      $q = Doctrine::getTable('Denomination')
        ->createQuery('d')
        ->orderBy('d.name')
        ->limit($request->getParameter('limit'))
        ->offset($request->getParameter('start'));

      if (!$this->getUser()->hasPermission('controlli'))
      {
        $q->where('d.unconfirmed = 0');
      }

      if ($request->hasParameter('query') && $request->getParameter('query') != '')
      {
        $query = $request->getParameter('query');
        $q->andWhere('d.name REGEXP ? OR d.aliases LIKE ?', array($query, '%'.$query.'%'));
      }

      $denominations = array();

      foreach ($q->execute() as $d)
      {
        if ($d->aliases !== null)
        {
          foreach (json_decode($d->aliases) as $i => $alias)
          {
            $denominations[] = array(
              'id'    => sprintf('%s-%s', $d->id, $i+1),
              'name'  => sprintf("%s [%s]", $alias, $d->name),
              'alias' => $alias,
              'identifier' => $d->id
            );
          }
        }

        $denominations[] = array(
          'id'    => $d->id,
          'name'  => $d->name,
          'alias' => $d->name,
          'identifier' => $d->id
        );
      }

      $this->result = array(
        'success' => true,
        'total'   => $q->count(),
        'data'    => $denominations
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
