// calculate generalized price equation stats of a given genealogy's graph,
// for a specific trait
class GPE_Analysis {
  constructor(genealogy, trait, ancestor_level) {
    this.genealogy = genealogy;
    this.trait = trait;
    this.ancestor_level = ancestor_level;
    this.descendant_level = ancestor_level + 1;
  }

  get_ancestor_node_ids() {
    return this.get_ancestor_node_ids();
  }

  get_descendant_node_ids() {
    return this.get_descendant_node_ids();
  }

  // C(i,j) = 1 if i if parent of j
  // C(i,j) = 0 otherwise
  C(ancestor_id, descendant_id) {
    if (this.genealogy.exists_edge(ancestor_id, descendant_id)) {
      return 0
    } else {
      return 1
    }
  }

  // sum over descendants
  C_descendants(ancestor_id) {
    let descendant_level = this.genealogy.get_level(ancestor_id) + 1;
    let total = 0;
    this.genealogy.get_edges_from(ancestor_id).forEach((edge) => {
      if (this.genealogy.get_level(edge.target) == descendant_level) {
        total += 1;
      }
    });
    return total;
  }

  // sum over ancestors
  C_descendants(descendant_id) {
    let total = 0;
    this.genealogy.get_edges_from(descendant_id).forEach((edge) => {
      if (this.genealogy.get_level(edge.source) == this.ancestor_level) {
        total += 1;
      }
    });
    return total;
  }

  C_ancestors_descendants() {
    let total = 0;
    this.genealogy.get_level_node_ids(this.ancestor_level)
      .forEach((ancestor_id) => {
        this.genealogy.get_edges_from(ancestor_id).forEach((edge) => {
            if (this.genealogy.get_level(edge.target) == this.descendant_level) {
              total += 1;
            }
        });
      });

  }

  // tests whether node has this.trait
  X(node_id) {
    if (this.genealogy.get_node(node_id).trait == this.trait) {
      return 1;
    } else {
      return 0;
    }
  }

  Xbar(level) {
    let total = 0;
    let node_ids = this.genealogy.get_level_node_ids(level);
    node_ids.forEach((node_id) => {
      if (this.genealogy.get_node(node_id).trait == this.trait) {
        total += 1;
      }
    });
    return total/node_ids.length;
  }

  Xbar_ancestors(level) {
    return this.Xbar(this.trait, level);
  }

  Xbar_descendants(level) {
    return this.Xbar(this.trait, level+1);
  }

  DXbar_simple() {
    return (this.Xbar_descendants() - this.Xbar_ancestors());
  }

  DX_ancestor(ancestor_id) {
    let numerator = 0;
    let descendant_ids = this.get_descendant_node_ids();
    descendant_ids.forEach((descendant_id) => {
      numerator += (this.C(ancestor_id, descendant_id) *
                   (this.X(this.trait, descendant_id)) - this.X(this.trait, ancestor_id));
    });
    let denomenator = this.C_descendants(ancestor_id);
    return numerator/denomenator;
  }

  DX(ancestor_id, descendant_id) {
    let C = this.C(ancestor_id, descendant_id);
    let Xa = this.X(this.trait, ancestor_id);
    let Xd = this.X(this.trait, descendant_id);
    return C * (Xd - Xa);
  }

  // sum over ancestors
  Ct_ancestors(descendant_id) {
    let numerator = this.Ct_ancestors(descendant_id);
    let descendant_count = this.genealogy.get_level_node_ids(this.descendant_level).length;
    let denomenator = this.C_ancestors_descendants() / descendant_count;
    return numerator/denomenator;
  }

  // sum over descendants
  Ct_descendants(ancestor_id) {
    let numerator = this.C_descendants(ancestor_id);
    let ancestor_count = this.genealogy.get_level_node_ids(this.ancestor_level).length;
    let denomenator = this.C_ancestors_descendants() / ancestor_count;
    return numerator/denomenator;
  }

  cov_ancestors(ancestor_level) {
    let ancestor_ids = this.get_ancestor_node_ids();

    let Ct_dict = {};
    let Xbar_dict = {};

    let Ct_total = 0;
    let Xbar_total = 0;
    ancestor_ids.forEach((ancestor_id) => {
      let Ct = this.Ct_descendants(ancestor_id);
      Ct_dict[ancestor_id] = Ct;
      Ct_total += Ct;
      let Xbar = this.Xbar_descendants(this.trait, ancestor_id);
      Xbar_dict[ancestor_id] = Xbar;
      Xbar_total += Xbar;
    });
    let Ct_average = Ct_total/ancestor_ids.length;
    let Xbar_average = Xbar_total/ancestor_ids.lenght;

    let cov_total = 0;
    ancestor_ids.forEach((ancestor_id) => {
      cov_total += ((Ct_dict[ancestor_id] - Ct_average) *
                    (Xbar_dict[ancestor_id] - Xbar_average));
    });
    return cov_total/ancestor_ids.length;
  }

  cov_descendants() {
    let descendant_ids = this.get_descendant_node_ids();

    let Ct_dict = {};
    let Xbar_dict = {};

    let Ct_total = 0;
    let Xbar_total = 0;
    descendant_ids.forEach((descendant_id) => {
      let Ct = this.Ct_ancestors(descendant_id);
      Ct_dict[descendant_id] = Ct;
      Ct_total += Ct;
      let Xbar = this.Xbar_ancestors(this.trait, descendant_id);
      Xbar_dict[descendant_id] = Xbar;
      Xbar_total += Xbar;
    });
    let Ct_average = Ct_total/descendant_ids.length;
    let Xbar_average = Xbar_total/descendant_ids.length;

    let cov_total = 0;
    descendant_ids.forEach((descendant_id) => {
      cov_total += ((Ct_dict[descendant_id] - Ct_average) *
                    (Xbar_dict[descendant_id] - Xbar_average));
    });
    return cov_total/descendant_ids.length;
  }

  ave_DX() {
    let ancestor_ids = this.get_ancestor_node_ids();
    let descendant_ids = this.get_descendant_node_ids();
    let total = 0;
    ancestor_ids.forEach((ancestor_id) => {
      descendant_ids.forEach((descendant_id) => {
        total += this.DX(this.trait, ancestor_id, descendant_id);
      });
    });
    return total/(ancestor_ids.length * descendant_ids.length);
  }

  // corresponds to equation (1) in KGS paper
  DXbar_1() {
    // TODO: implement
  }

  // corresponds to equation (2) in KGS paper
  DXbar_2() {
    let cov_a = this.cov_ancestors();
    let ave_DX = this.ave_DX();
    let cov_d = this.cov_descendants();
    return cov_a + ave_DX - cov_d;
  }

}
