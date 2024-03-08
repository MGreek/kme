package com.example.kmebackend.model

import jakarta.persistence.*
import jakarta.validation.constraints.AssertTrue

@Embeddable
data class GroupingEntryId(
    @Embedded
    val groupingId: GroupingId,
    @Column(name = "grouping_entries_order")
    val groupingEntriesOrder: Long,
)

@Entity
data class GroupingEntry(
    @EmbeddedId
    val groupingEntryId: GroupingEntryId,
    @MapsId("groupingId") @ManyToOne
    val grouping: Grouping,
    @OneToOne(optional = true)
    val chord: Chord? = null,
    @OneToOne(optional = true)
    val rest: Rest? = null,
    val metadata: String? = null,
) {
    @AssertTrue
    private fun hasEntry() = (chord != null && rest == null) || (chord == null && rest != null)
}
